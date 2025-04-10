### Questions

- Should we show the WP and PHP version in simple sites?
- SiteMonitorUptimeCard currently calculates uptime percentage based on days with `up` and `down`. Should we do this by calculating minutes or something else? What would be the value of a day, if a site was down for 30 minutes for example?
- Check if we want to import from react or wp/element.
- `OverviewSection` handle if no elements are rendered to render nothing.
- Can we have the `OverviewSection` Grid update columns in CSS? I tried but couldn't make it work and used JS for now.
- Check possible nuances around `fetchSiteEngagementStats`. For example if there are needed checks for availability of stats, returned data and manipulation.
- Check which Badge component to use (CoreBadge, automattic/components or a different one).
- For now some cards like ViewsCard and VisitorsCard are almost identical. Keep that in mind as we proceed if we can/should use a reusable wrapper component.
- Should we use `useQuery` inside the components or at the parent `overview` page?
- Investigate the endpoints used in `PerformanceCards`. They return info about jobs `queued|running` and we have to use `refetchInterval` until we have both results. Is there a better way to do this and use a cached value? That would solve the delayed rendering of these cards.
