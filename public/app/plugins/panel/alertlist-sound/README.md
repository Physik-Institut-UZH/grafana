# Alert List Panel with Sound

This Alert List - Sound panel is a modified version of the Alert list panel provided with Grafana.

The Alert List - Sound panel allows you to display alerts on a dashboard. The list can be configured to show either the current state of your alerts or recent alert state changes. You can read more about alerts [here](http://docs.grafana.org/alerting/rules).

In addition, sounds can be played when an alarm is PENDING or ALERTING. Users can attribute custom files by adding an Alert Tag to any given alert. The tag must be:

Tag Name: path

Tag Value: "PATH OF THE AUDIO FILE"

The source file must be place in the Graphana directory path "\public\app\plugins\panel\alertlist-sound\sound"

To play a file from Google Drive, upload the file to the Drive, then enter the Tag Value https://docs.google.com/uc?export=download&id=XXXXXXXXXXXXX, replacing the XXXXX by the file ID.