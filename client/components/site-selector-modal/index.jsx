/**
 * External dependencies
 */
var React = require( 'react' ),
	classnames = require( 'classnames' ),
	includes = require( 'lodash/includes' );

/**
 * Internal dependencies
 */
var Dialog = require( 'components/dialog' ),
	Button = require( 'components/button' ),
	SitesDropdown = require( 'components/sites-dropdown' ),
	sitesList = require( 'lib/sites-list' )();

/**
 * Component
 */
var SiteSelectorModal = React.createClass( {
	propTypes: {
		// children: Custom content. Will be displayed above the `SitesDropdown`.
		children: React.PropTypes.node,
		// filter: Function to filter sites to display
		filter: React.PropTypes.func,
		// hide: Will be called when clicking either button. Should toggle the `isVisible` prop.
		hide: React.PropTypes.func.isRequired,
		// isVisible: Determines if `SiteSelectorModal` will be displayed.
		isVisible: React.PropTypes.bool.isRequired,
		// mainAction: Will be run upon clicking the call-for-action button. Receives `site` as argument.
		mainAction: React.PropTypes.func.isRequired,
		// getMainUrl: Use if the call-for-action button should be turned into an `<a>` link. Receives `site` as argument, returns a URL.
		getMainUrl: React.PropTypes.func,
		// mainActionLabel: Label for the call-for-action button.
		mainActionLabel: React.PropTypes.string.isRequired,
		// className: class name(s) to be added to the Dialog
		className: React.PropTypes.string
	},

	getInitialState: function() {
		const primarySite = sitesList.getPrimary();
		let filteredSites = sitesList.getVisible();

		if ( this.props.filter ) {
			filteredSites = filteredSites.filter( this.props.filter );
		}

		return {
			site: includes( filteredSites, primarySite )
				? primarySite
				: filteredSites[0]
		};
	},

	setSite: function( slug ) {
		var site = sitesList.getSite( slug );
		this.setState( { site: site } );
	},

	onClose: function( action ) {
		if ( 'mainAction' === action ) {
			this.props.mainAction( this.state.site );
		}

		this.props.hide();
	},

	onButtonClick: function() {
		this.props.mainAction( this.state.site );
	},

	getMainLink: function() {
		var url = this.props.getMainUrl && this.props.getMainUrl( this.state.site );

		return url
			? <Button primary href={ url } onClick={ this.onButtonClick } >{ this.props.mainActionLabel }</Button>
			: { action: 'mainAction', label: this.props.mainActionLabel, isPrimary: true };
	},

	render: function() {
		var mainLink = this.getMainLink(),
			buttons = [
				{ action: 'back', label: this.translate( 'Back' ) },
				mainLink
			],
			classNames = classnames( 'site-selector-modal', this.props.className );

		return (
			<Dialog className={ classNames }
				isVisible={ this.props.isVisible }
				buttons={ buttons }
				onClose={ this.onClose }>
				<div className="site-selector-modal__content">
					{ this.props.children }
				</div>
				<SitesDropdown
					onSiteSelect={ this.setSite }
					selected={ this.state.site.slug }
					filter={ this.props.filter } />
			</Dialog>
		);
	}
} );

module.exports = SiteSelectorModal;
