/**
 * External dependencies
 */
var page = require('page'), React = require('react');

/**
 * Internal dependencies
 */
var HeaderCake = require('components/header-cake'),
    Main = require('components/main'),
    SiteRedirectStep = require('./site-redirect-step'),
    observe = require('lib/mixins/data-observe');

var SiteRedirect = React.createClass({
    mixins: [observe('productsList', 'sites')],

    propTypes: {
        productsList: React.PropTypes.object.isRequired,
        sites: React.PropTypes.object.isRequired,
    },

    componentWillMount: function() {
        this.checkSiteIsUpgradeable();
    },

    componentDidMount: function() {
        this.props.sites.on('change', this.checkSiteIsUpgradeable);
    },

    componentWillUnmount: function() {
        this.props.sites.off('change', this.checkSiteIsUpgradeable);
    },

    checkSiteIsUpgradeable: function() {
        var selectedSite = this.props.sites.getSelectedSite();

        if (selectedSite && !selectedSite.isUpgradeable()) {
            page.redirect('/domains/add');
        }
    },

    backToDomainSearch: function() {
        page('/domains/add/' + this.props.sites.getSelectedSite().slug);
    },

    render: function() {
        return (
            <Main>
                <HeaderCake onClick={this.backToDomainSearch}>
                    {this.translate('Redirect a Site')}
                </HeaderCake>

                <SiteRedirectStep
                    cart={this.props.cart}
                    products={this.props.productsList.get()}
                    selectedSite={this.props.sites.getSelectedSite()}
                />
            </Main>
        );
    },
});

module.exports = SiteRedirect;
