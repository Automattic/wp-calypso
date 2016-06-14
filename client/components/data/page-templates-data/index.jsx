/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import debugModule from 'debug';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import PageTemplatesStore from 'lib/page-templates/store';
import PageTemplatesActions from 'lib/page-templates/actions';
import sitesList from 'lib/sites-list';
import passToChildren from 'lib/react-pass-to-children';
import { getCurrentTheme } from 'state/themes/current-theme/selectors';

/**
 * Module variables
 */
const sites = sitesList();
const debug = debugModule( 'calypso:page-templates-data' );

const PageTemplatesData = React.createClass( {

	propTypes: {
		currentTheme: React.PropTypes.object,
		siteId: PropTypes.number.isRequired
	},

	getInitialState() {
		return {
			pageTemplates: []
		};
	},

	componentWillMount() {
		let site = sites.getSite( this.props.siteId );
		this.activeTheme = site.options ? site.options.theme_slug : null;
		PageTemplatesStore.on( 'change', this._updateState );
		site.on( 'change', this._fetchTemplatesIfThemeChanges );
		this._updateState();
		// defer initial fetch to avoid dispatcher conflict
		setTimeout( () => this._fetchIfUnfetched(), 0 );
	},

	componentWillUnmount() {
		let site = sites.getSite( this.props.siteId );
		PageTemplatesStore.off( 'change', this._updateState );
		site.off( 'change', this._fetchTemplatesIfThemeChanges );
	},

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.siteId === this.props.siteId ) {
			if ( nextProps.currentTheme && nextProps.currentTheme.stylesheet !== this.activeTheme ) {
				PageTemplatesActions.fetchPageTemplates( this.props.siteId );
				this.activeTheme = nextProps.currentTheme.stylesheet;
			}
			return;
		}
		this._fetchIfUnfetched( nextProps.siteId );
		this._updateState( nextProps.siteId );
		let oldSite = sites.getSite( this.props.siteId );
		let newSite = sites.getSite( nextProps.siteId );
		this.activeTheme = newSite.options ? newSite.options.theme_slug : null;
		oldSite.off( 'change', this._fetchTemplatesIfThemeChanges );
		newSite.on( 'change', this._fetchTemplatesIfThemeChanges );
	},

	render() {
		debug( 'rendering page templates data for site ' + this.props.siteId, this.state );
		return passToChildren( this, this.state );
	},

	_fetchIfUnfetched( siteId ) {
		siteId = siteId || this.props.siteId;
		if ( PageTemplatesStore.isInitialized( siteId ) ) {
			return;
		}
		PageTemplatesActions.fetchPageTemplates( siteId );
	},

	_fetchTemplatesIfThemeChanges() {
		let site = sites.getSite( this.props.siteId );
		if ( site.options && site.options.theme_slug === this.activeTheme ) {
			return;
		}
		this.activeTheme = site.options ? site.options.theme_slug : null;
		PageTemplatesActions.fetchPageTemplates( this.props.siteId );
	},

	_getUpdatedState( siteId ) {
		let defaultTemplate = { label: this.translate( 'Default Template' ), file: '' };
		siteId = siteId || this.props.siteId;
		return {
			pageTemplates: [ defaultTemplate ].concat( PageTemplatesStore.getPageTemplates( siteId ) ),
			isFetchingPageTemplates: PageTemplatesStore.isFetchingPageTemplates( siteId ),
			isInitializedPageTemplates: PageTemplatesStore.isInitialized( siteId ),
		};
	},

	_updateState( siteId ) {
		siteId = siteId || this.props.siteId;
		this.setState( this._getUpdatedState( siteId ) );
	}
} );

export default connect(
	( state, ownProps ) => (
		{ currentTheme: getCurrentTheme( state, ownProps.siteId ) }
	)
)( PageTemplatesData );
