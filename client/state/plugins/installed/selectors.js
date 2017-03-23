import { every, filter, find, pick, reduce, some, sortBy, values } from 'lodash';

const _filters = {
    none: function() {
        return false;
    },
    all: function() {
        return true;
    },
    active: function(plugin) {
        return some(plugin.sites, function(site) {
            return site.active;
        });
    },
    inactive: function(plugin) {
        return some(plugin.sites, function(site) {
            return !site.active;
        });
    },
    updates: function(plugin) {
        return some(plugin.sites, function(site) {
            return site.update;
        });
    },
    isEqual: function(pluginSlug, plugin) {
        return plugin.slug === pluginSlug;
    },
};

export function isRequesting(state, siteId) {
    if (typeof state.plugins.installed.isRequesting[siteId] === 'undefined') {
        return false;
    }
    return state.plugins.installed.isRequesting[siteId];
}

export function isRequestingForSites(state, sites) {
    // As long as any sites have isRequesting true, we consider this group requesting
    return some(sites, siteId => isRequesting(state, siteId));
}

export function getPlugins(state, sites, pluginFilter) {
    let pluginList = reduce(
        sites,
        (memo, site) => {
            const list = state.plugins.installed.plugins[site.ID] || [];
            list.forEach(item => {
                const sitePluginInfo = pick(item, ['active', 'autoupdate', 'update']);
                if (memo[item.slug]) {
                    memo[item.slug].sites = {
                        ...memo[item.slug].sites,
                        [site.ID]: sitePluginInfo,
                    };
                } else {
                    memo[item.slug] = { ...item, sites: { [site.ID]: sitePluginInfo } };
                }
            });
            return memo;
        },
        {}
    );

    if (pluginFilter && _filters[pluginFilter]) {
        pluginList = filter(pluginList, _filters[pluginFilter]);
    }
    return values(sortBy(pluginList, item => item.slug.toLowerCase()));
}

export function getPluginsWithUpdates(state, sites) {
    return filter(getPlugins(state, sites), _filters.updates);
}

export function getPluginOnSite(state, site, pluginSlug) {
    const pluginList = getPlugins(state, [site]);
    return find(pluginList, { slug: pluginSlug });
}

export function getSitesWithPlugin(state, sites, pluginSlug) {
    const pluginList = getPlugins(state, sites);
    const plugin = find(pluginList, { slug: pluginSlug });
    if (!plugin) {
        return [];
    }

    // Filter the requested sites list by the list of sites for this plugin
    const pluginSites = filter(sites, site => {
        return plugin.sites.hasOwnProperty(site.ID);
    });

    return sortBy(pluginSites, item => item.title.toLowerCase());
}

export function getSitesWithoutPlugin(state, sites, pluginSlug) {
    const installedOnSites = getSitesWithPlugin(state, sites, pluginSlug) || [];
    return filter(sites, function(site) {
        if (!site.visible || !site.jetpack) {
            return false;
        }

        if (site.jetpack && site.isSecondaryNetworkSite()) {
            return false;
        }

        return every(installedOnSites, function(installedOnSite) {
            return installedOnSite.slug !== site.slug;
        });
    });
}

export function getStatusForPlugin(state, siteId, pluginId) {
    if (typeof state.plugins.installed.status[siteId] === 'undefined') {
        return false;
    }
    if (typeof state.plugins.installed.status[siteId][pluginId] === 'undefined') {
        return false;
    }
    const status = state.plugins.installed.status[siteId][pluginId];
    return Object.assign({}, status, { siteId: siteId, pluginId: pluginId });
}

export function isPluginDoingAction(state, siteId, pluginId) {
    const status = getStatusForPlugin(state, siteId, pluginId);
    return !!status && 'inProgress' === status.status;
}
