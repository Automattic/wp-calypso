### Questions

- Should we show the WP and PHP version in simple sites?
- SiteMonitorUptimeCard currently calculates uptime percentage based on days with `up` and `down`. Should we do this by calculating minutes or something else? What would be the value of a day, if a site was down for 30 minutes for example?
- Check if we want to import from react or wp/element.
- `OverviewSection` handle if no elements are rendered to render nothing.
- Probably have the `OverviewSection` Grid dynamically update columns in JS.
- Check possible nuances around `fetchSiteEngagementStats`. For example if there are needed checks for availability of stats, returned data and manipulation.
- Check which Badge component to use (CoreBadge, automattic/components or a different one).
- For now some cards like ViewsCard and VisitorsCard are almost identical. Keep that in mind as we proceed if we can/should use a reusable wrapper component.
