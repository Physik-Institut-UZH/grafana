import { map, defaults, sortBy } from 'lodash';
import { getBackendSrv } from '@grafana/runtime';
import { dateMath, dateTime, PanelEvents } from '@grafana/data';
import { auto, IScope } from 'angular';

import alertDef from '../../../features/alerting/state/alertDef';
import { PanelCtrl } from 'app/plugins/sdk';
import { promiseToDigest } from 'app/core/utils/promiseToDigest';

class AlertListSoundPanel extends PanelCtrl {
  static templateUrl = 'module.html';
  static scrollable = true;

  showOptions = [
    { text: 'Current state', value: 'current' },
    { text: 'Recent state changes', value: 'changes' },
  ];

  sortOrderOptions = [
    { text: 'Alphabetical (asc)', value: 1 },
    { text: 'Alphabetical (desc)', value: 2 },
    { text: 'Importance', value: 3 },
    { text: 'Time (asc)', value: 4 },
    { text: 'Time (desc)', value: 5 },
  ];

  soundOptions = [
    {
      text: 'Cryostat Pressure < 1.8 bar',
      value: 'public/app/plugins/panel/alertlist-sound/sound/alarm-cryostat-pressure-b1_8.mp3',
    },
    {
      text: 'Cryostat Pressure > 2.3 bar',
      value: 'public/app/plugins/panel/alertlist-sound/sound/alarm-cryostat-pressure-o2_3.mp3',
    },
    {
      text: 'Cryostat Pressure > 2.5 bar',
      value: 'public/app/plugins/panel/alertlist-sound/sound/alarm-cryostat-pressure-o2_5.mp3',
    },
    {
      text: 'Cryostat Temperature < 165 K',
      value: 'public/app/plugins/panel/alertlist-sound/sound/alarm-cryo-temp-b165.mp3',
    },
    {
      text: 'Cryostat Temperature High',
      value: 'public/app/plugins/panel/alertlist-sound/sound/alarm-cryo-temp-high.mp3',
    },
    {
      text: 'Cryostat Temperature Low',
      value: 'public/app/plugins/panel/alertlist-sound/sound/alarm-cryo-temp-low.mp3',
    },
    {
      text: 'Cryostat Temperature > 180 K',
      value: 'public/app/plugins/panel/alertlist-sound/sound/alarm-cryo-temp-o180K.mp3',
    },
    {
      text: 'Flow',
      value: 'public/app/plugins/panel/alertlist-sound/sound/alarm-flow.mp3',
    },
    {
      text: 'Generic Alarm',
      value: 'public/app/plugins/panel/alertlist-sound/sound/alarm-plain.mp3',
    },
    {
      text: 'HE Temperature < 160 K',
      value: 'public/app/plugins/panel/alertlist-sound/sound/alarm-HE-temp-b160.mp3',
    },
    {
      text: 'HE Temperature > 350 K',
      value: 'public/app/plugins/panel/alertlist-sound/sound/alarm-HE-temp-o350.mp3',
    },
    {
      text: 'LN2 High',
      value: 'public/app/plugins/panel/alertlist-sound/sound/alarm-ln2-high.mp3',
    },
    {
      text: 'LN2 Low',
      value: 'public/app/plugins/panel/alertlist-sound/sound/alarm-ln2-low.mp3',
    },
    {
      text: 'Multiple',
      value: 'public/app/plugins/panel/alertlist-sound/sound/alarm-multiple.mp3',
    },
    {
      text: 'Oxygen',
      value: 'public/app/plugins/panel/alertlist-sound/sound/alarm-oxygen.mp3',
    },
    {
      text: 'Pending',
      value: 'public/app/plugins/panel/alertlist-sound/sound/alarm-pending.mp3',
    },
    {
      text: 'Pressure',
      value: 'public/app/plugins/panel/alertlist-sound/sound/alarm-pressure.mp3',
    },
    {
      text: 'Pump Inner Space',
      value: 'public/app/plugins/panel/alertlist-sound/sound/alarm-pump-inner.mp3',
    },
    {
      text: 'Pump Pressure inlet',
      value: 'public/app/plugins/panel/alertlist-sound/sound/alarm-pump-pressure-o3.mp3',
    },
    {
      text: 'Pump Pressure Outlet',
      value: 'public/app/plugins/panel/alertlist-sound/sound/alarm-pump-pressure-o4.mp3',
    },
    { text: 'Resolved', value: 'public/app/plugins/panel/alertlist-sound/sound/alarm-resolved.mp3' },
    { text: 'Temperature', value: 'public/app/plugins/panel/alertlist-sound/sound/alarm-temp.mp3' },
  ];

  stateFilter: any = {};
  currentAlerts: any = [];
  alertHistory: any = [];
  noAlertsMessage: string;
  templateSrv: string;
  audio: any;
  lastRefreshAt: any;

  // Set and populate defaults
  panelDefaults: any = {
    show: 'current',
    limit: 10,
    stateFilter: [],
    onlyAlertsOnDashboard: false,
    sortOrder: 1,
    dashboardFilter: '',
    nameFilter: '',
    folderId: null,
    sound: false,
    soundFile: 'public/app/plugins/panel/alertlist-sound/sound/alarm-plain.mp3',
  };
  /** @ngInject */
  constructor($scope: IScope, $injector: auto.IInjectorService) {
    super($scope, $injector);
    defaults(this.panel, this.panelDefaults);

    this.events.on(PanelEvents.editModeInitialized, this.onInitEditMode.bind(this));
    this.events.on(PanelEvents.refresh, this.onRefresh.bind(this));
    this.templateSrv = this.$injector.get('templateSrv');

    for (const key in this.panel.stateFilter) {
      this.stateFilter[this.panel.stateFilter[key]] = true;
    }
    //@ts-ignore
    window.paths = [
      'public/app/plugins/panel/alertlist-sound/sound/alarm-plain.mp3',
      'public/app/plugins/panel/alertlist-sound/sound/alarm-plain.mp3',
      'public/app/plugins/panel/alertlist-sound/sound/alarm-plain.mp3',
      'public/app/plugins/panel/alertlist-sound/sound/alarm-plain.mp3',
    ];
    //@ts-ignore
    window.soundFileTemp = [
      'public/app/plugins/panel/alertlist-sound/sound/alarm-plain.mp3',
      'public/app/plugins/panel/alertlist-sound/sound/alarm-plain.mp3',
      'public/app/plugins/panel/alertlist-sound/sound/alarm-plain.mp3',
      'public/app/plugins/panel/alertlist-sound/sound/alarm-plain.mp3',
    ];
    //@ts-ignore
    window.isAlerting = false;
    this.audio = new Audio();
    this.audio.load();
    this.lastRefreshAt = Date.now();
  }

  updatesoundFile() {
    this.setsoundFile();
    this.playSound();
    this.onRefresh();
  }

  async getAlerts() {
    promiseToDigest(this.$scope)(
      getBackendSrv()
        .get('/api/alerts')
        .then((data) => {
          return data;
        })
    );
  }

  getPath(Alerts: any, i: any) {
    var filePath;
    let id = Alerts.id;
    promiseToDigest(this.$scope)(
      getBackendSrv()
        .get('/api/alerts/' + id, {}) // on injecte le id a l'url qu'il faut appeler
        .then((data) => {
          // le tag va etre qqpart ici

          if (!data.Settings.alertRuleTags.path) {
            filePath = 'public/app/plugins/panel/alertlist-sound/sound/alarm-plain.mp3';
          } else {
            filePath = data.Settings.alertRuleTags.path;
          }
          //@ts-ignore
          window.soundFileTemp[i] = filePath;
        })
    );
    return filePath;
  }

  setsoundFile() {
    //window.soundFile += "?id=" + ((Math.random() * 1000) + 1);
    //@ts-ignore
    this.audio.src = window.soundFile;
    this.audio.load();
  }

  setsoundFileMultiple() {
    this.audio.src = 'public/app/plugins/panel/alertlist-sound/sound/alarm-multiple.mp3';
    this.audio.load();
  }

  playSound() {
    var playPromise = this.audio.play();
    playPromise
      .then(function () {})
      .catch(function (error: any) {
        function checkSuccess() {
          var audioErr = new Audio();
          audioErr.src = 'public/app/plugins/panel/alertlist-sound/sound/alarm-plain.mp3';
          audioErr.load();
          audioErr.play();
        }
        checkSuccess();
      });

    if (playPromise !== undefined) {
      playPromise.then(function () {}).catch(function (error: any) {});
    }
  }

  sortResult(alerts: any[]) {
    if (this.panel.sortOrder === 3) {
      return sortBy(alerts, (a) => {
        // @ts-ignore
        return alertDef.alertStateSortScore[a.state || a.newState];
      });
    } else if (this.panel.sortOrder === 4) {
      return sortBy(alerts, (a) => {
        return new Date(a.newStateDate || a.time);
      });
    } else if (this.panel.sortOrder === 5) {
      return sortBy(alerts, (a) => {
        return new Date(a.newStateDate || a.time);
      }).reverse();
    }

    const result = sortBy(alerts, (a) => {
      return (a.name || a.alertName).toLowerCase();
    });
    if (this.panel.sortOrder === 2) {
      result.reverse();
    }

    return result;
  }

  updateStateFilter() {
    const result = [];

    for (const key in this.stateFilter) {
      if (this.stateFilter[key]) {
        result.push(key);
      }
    }

    this.panel.stateFilter = result;
    this.onRefresh();
  }

  onRefresh() {
    let getAlertsPromise: any;

    if (this.panel.show === 'current') {
      getAlertsPromise = this.getCurrentAlertState();
    } else if (this.panel.show === 'changes') {
      getAlertsPromise = this.getStateChanges();
    } else {
      getAlertsPromise = Promise.resolve();
    }
    //@ts-ignore
    if (!window.alerts) {
      getBackendSrv()
        .get('/api/alerts')
        .then((data) => {
          //@ts-ignore
          window.alerts = data;
          getAlertsPromise.then(() => {
            this.renderingCompleted();
            this.lastRefreshAt = Date.now();
          });
        });
    } else {
      getAlertsPromise.then(() => {
        this.renderingCompleted();
        this.lastRefreshAt = Date.now();
      });
    }
  }

  onFolderChange = (folder: any) => {
    this.panel.folderId = folder.id;
    this.refresh();
  };

  getStateChanges() {
    const params: any = {
      limit: this.panel.limit,
      type: 'alert',
      newState: this.panel.stateFilter,
    };

    if (this.panel.onlyAlertsOnDashboard) {
      params.dashboardId = this.dashboard.id;
    }

    params.from = dateMath.parse(this.dashboard.time.from)!.unix() * 1000;
    params.to = dateMath.parse(this.dashboard.time.to)!.unix() * 1000;

    return promiseToDigest(this.$scope)(
      getBackendSrv()
        .get('/api/annotations', params, `alert-list-get-state-changes-${this.panel.id}`)
        .then((data) => {
          this.alertHistory = this.sortResult(
            map(data, (al) => {
              al.time = this.dashboard.formatDate(al.time, 'MMM D, YYYY HH:mm:ss');
              al.stateModel = alertDef.getStateDisplayModel(al.newState);
              al.info = alertDef.getAlertAnnotationInfo(al);
              return al;
            })
          );

          this.noAlertsMessage = this.alertHistory.length === 0 ? 'No alerts in current time range' : '';

          return this.alertHistory;
        })
    );
  }

  getCurrentAlertState() {
    var soundFlag = false;
    var multipleAlert = false;

    const params: any = {
      state: this.panel.stateFilter,
    };

    if (this.panel.nameFilter) {
      params.query = this.templateSrv.replace(this.panel.nameFilter, this.panel.scopedVars);
    }

    if (this.panel.folderId >= 0) {
      params.folderId = this.panel.folderId;
    }

    if (this.panel.dashboardFilter) {
      params.dashboardQuery = this.panel.dashboardFilter;
    }

    if (this.panel.onlyAlertsOnDashboard) {
      params.dashboardId = this.dashboard.id;
    }

    if (this.panel.dashboardTags) {
      params.dashboardTag = this.panel.dashboardTags;
    }

    return promiseToDigest(this.$scope)(
      getBackendSrv()
        .get('/api/alerts', params, `alert-list-get-current-alert-state-${this.panel.id}`)
        .then((data) => {
          this.currentAlerts = this.sortResult(
            map(data, (al) => {
              al.stateModel = alertDef.getStateDisplayModel(al.state);
              al.newStateDateAgo = dateTime(al.newStateDate).locale('en').fromNow(true);
              return al;
            })
          );
          if (this.currentAlerts.length > this.panel.limit) {
            this.currentAlerts = this.currentAlerts.slice(0, this.panel.limit);
          }
          this.noAlertsMessage = this.currentAlerts.length === 0 ? 'No alerts' : '';
          multipleAlert = false;

          var counter = 0;
          for (let _ in this.currentAlerts) {
            var alert = this.currentAlerts[_];
            this.getPath(alert, counter);

            //@ts-ignore
            window.paths[_] = window.soundFileTemp[_];

            //var newStateDate = Date.now();

            if (alert.stateModel.text === 'ALERTING') {
              //@ts-ignore
              window.soundFile = window.paths[_];

              if (soundFlag === true) {
                multipleAlert = true;
              }
              soundFlag = true;
              //@ts-ignore
              window.isAlerting = true;
            }

            if (alert.stateModel.text === 'PENDING' && soundFlag === false) {
              //@ts-ignore
              window.soundFile = 'public/app/plugins/panel/alertlist-sound/sound/alarm-pending.mp3';
              soundFlag = true;
            }
            counter = counter + 1;
          }

          this.setsoundFile();
          if (soundFlag === true && this.panel.sound === true) {
            if (multipleAlert === true) {
              this.setsoundFileMultiple();
            }
            this.playSound();
            //@ts-ignore
          } else if (soundFlag === false && window.isAlerting === true && this.panel.sound === true) {
            //@ts-ignore
            window.soundFile = 'public/app/plugins/panel/alertlist-sound/sound/alarm-resolved.mp3';
            this.setsoundFile();
            this.playSound();
            //@ts-ignore
            window.isAlerting = false;
          }

          return this.currentAlerts;
        })
    );
  }

  onInitEditMode() {
    this.addEditorTab('Options', 'public/app/plugins/panel/alertlist-sound/editor.html');
  }
}

export { AlertListSoundPanel, AlertListSoundPanel as PanelCtrl };
