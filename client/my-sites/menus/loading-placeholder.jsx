/**
 * External dependencies
 */
var React = require('react');

/**
 * Internal dependencies
 */
var SidebarNavigation = require('my-sites/sidebar-navigation'),
    MenuPlaceholder = require('./menu-placeholder');

/**
 * Component
 */
var LoadingPlaceholder = React.createClass({
    render: function() {
        return (
            <div className="main main-column manage-menus" role="main">
                <SidebarNavigation />
                <div className="menus__pickers">
                    <div className="menus__picker is-location">
                        <label>
                            <span className="placeholder-text">Counting menu areas...</span>
                        </label>
                        <div className="menus__picker-select-placeholder">
                            <span className="placeholder-text">Loading menu areas...</span>
                        </div>
                    </div>
                    <p className="menus__pickers-conjunction">{this.translate('uses')}</p>
                    <div className="menus__picker is-menu">
                        <label><span className="placeholder-text">Counting menus...</span></label>
                        <div className="menus__picker-select-placeholder">
                            <span className="placeholder-text">Loading menus...</span>
                        </div>
                    </div>
                </div>
                <MenuPlaceholder />
            </div>
        );
    },
});

module.exports = LoadingPlaceholder;
