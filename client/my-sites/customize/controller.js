/**
 * External Dependencies
 */
var i18n = require('i18n-calypso'),
    ReactDom = require('react-dom'),
    React = require('react'),
    ReduxProvider = require('react-redux').Provider;

/**
 * Internal Dependencies
 */
var sites = require('lib/sites-list')(),
    route = require('lib/route'),
    analytics = require('lib/analytics'),
    setTitle = require('state/document-head/actions').setDocumentHeadTitle;

module.exports = {
    customize: function(context) {
        var CustomizeComponent = require('my-sites/customize/main'),
            basePath = route.sectionify(context.path);

        analytics.pageView.record(basePath, 'Customizer');

        context.store.dispatch(setTitle(i18n.translate('Customizer', { textOnly: true }))); // FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.

        ReactDom.render(
            React.createElement(
                ReduxProvider,
                { store: context.store },
                React.createElement(CustomizeComponent, {
                    domain: context.params.domain || '',
                    sites: sites,
                    prevPath: context.prevPath || '',
                    query: context.query,
                    panel: context.params.panel,
                })
            ),
            document.getElementById('primary')
        );
    },
};
