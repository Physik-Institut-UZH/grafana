
# Notes From Ale
This is a special version of Grafana with added the plugin made by Fred. This plugin is not recommended, see below, but wanted by users.
If you want to update version of Grafana in the SC and keep this plugin then do the following:

```bash
# add the original grafana as remote
git remote add upstream git@github.com:grafana/grafana.git

# fetch all newest update
git fetch upstream

# Show tags
git tag 

# get the commit ID related to the release you want
# for example
git show v8.0.1

# once you get the commit ID then merge with it
# for example
git merge 8849243d272e57fd3f7a50c0e02f6a4f00bbeb04

# now commit and push
git commit -a -m "I'm stupid if I write this"
git push

# Now build the docker container -  this takes ages
sudo docker build -f Dockerfile -t xenoscopesc/grafana-alert-sound:v_WRITE_HERE_VERSION .

# Now test the docker container
sudo docker run --network host xenoscopesc/grafana-alert-sound:v_WRITE_HERE_VERSION

# Now login to docker hub with credential of xenoscopesc (password is in service_accounts)
sudo docker login

# Push the container new tag version to the hub
sudo docker push xenoscopesc/grafana-alert-sound:v_WRITE_HERE_VERSION

```

## Why this is a bad idea

This plugin is basically meant for alarm aknowledge, however by doing so it creates an additional problem.
The idea is that you have this thing beeping untill somebody `aknowledge` it and fix the issue.
This is a bad idea because:

- It is annoying to have a beeping sound repeatedly when an alarm is firing (especially in the assembly hall), so this will push the users to deactivate the firing alarms on Grafana, which is an anti-pattern because soon or later you will forget to turn the alarm on again (once the issue is fixed).
- Alert-Manager silences (which is the right practice to employ) do not shut-down this sound-plugin, so the thing will keep beeping.
- You can achieve the same effect by configuring it on your smartphone, making the smartphone ring at intervalls untill you actually see the SMS. Android can do it, probably IPhone too.

## Grafana

![Grafana](docs/logo-horizontal.png)

The open-source platform for monitoring and observability.

[![License](https://img.shields.io/github/license/grafana/grafana)](LICENSE)
[![Drone](https://drone.grafana.net/api/badges/grafana/grafana/status.svg)](https://drone.grafana.net/grafana/grafana)
[![Go Report Card](https://goreportcard.com/badge/github.com/grafana/grafana)](https://goreportcard.com/report/github.com/grafana/grafana)

Grafana allows you to query, visualize, alert on and understand your metrics no matter where they are stored. Create, explore, and share dashboards with your team and foster a data driven culture:

- **Visualize:** Fast and flexible client side graphs with a multitude of options. Panel plugins offer many different ways to visualize metrics and logs.
- **Dynamic Dashboards:** Create dynamic & reusable dashboards with template variables that appear as dropdowns at the top of the dashboard.
- **Explore Metrics:** Explore your data through ad-hoc queries and dynamic drilldown. Split view and compare different time ranges, queries and data sources side by side.
- **Explore Logs:** Experience the magic of switching from metrics to logs with preserved label filters. Quickly search through all your logs or streaming them live.
- **Alerting:** Visually define alert rules for your most important metrics. Grafana will continuously evaluate and send notifications to systems like Slack, PagerDuty, VictorOps, OpsGenie.
- **Mixed Data Sources:** Mix different data sources in the same graph! You can specify a data source on a per-query basis. This works for even custom datasources.

## Get started

- [Get Grafana](https://grafana.com/get)
- [Installation guides](http://docs.grafana.org/installation/)

Unsure if Grafana is for you? Watch Grafana in action on [play.grafana.org](https://play.grafana.org/)!

## Documentation

The Grafana documentation is available at [grafana.com/docs](https://grafana.com/docs/).

## Contributing

If you're interested in contributing to the Grafana project:

- Start by reading the [Contributing guide](/CONTRIBUTING.md).
- Learn how to set up your local environment, in our [Developer guide](/contribute/developer-guide.md).
- Explore our [beginner-friendly issues](https://github.com/grafana/grafana/issues?q=is%3Aopen+is%3Aissue+label%3A%22beginner+friendly%22).
- Look through our [style guide and Storybook](https://developers.grafana.com/ui/latest/index.html).

## Get involved

- Follow [@grafana on Twitter](https://twitter.com/grafana/).
- Read and subscribe to the [Grafana blog](https://grafana.com/blog/).
- If you have a specific question, check out our [discussion forums](https://community.grafana.com/).
- For general discussions, join us on the [official Slack](http://slack.raintank.io/) team.

## License

Grafana is distributed under [AGPL-3.0-only](LICENSE). For Apache-2.0 exceptions, see [LICENSING.md](LICENSING.md).
