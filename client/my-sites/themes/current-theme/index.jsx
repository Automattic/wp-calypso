/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { map, pickBy } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import CurrentThemeButton from './button';
import { connectOptions } from '../theme-options';
import { trackClick } from '../helpers';
import { isJetpackSite } from 'state/sites/selectors';
import { getActiveTheme, getTheme } from 'state/themes/selectors';
import QueryActiveTheme from 'components/data/query-active-theme';
import QueryTheme from 'components/data/query-theme';

/**
 * Show current active theme for a site, with
 * related actions.
 */
const CurrentTheme = React.createClass( {

	propTypes: {
		options: PropTypes.objectOf( PropTypes.shape( {
			label: PropTypes.string.isRequired,
			icon: PropTypes.string.isRequired,
			getUrl: PropTypes.func.isRequired
		} ) ),
		siteId: PropTypes.number.isRequired,
		// connected props
		currentTheme: PropTypes.object
	},

	trackClick: trackClick.bind( null, 'current theme' ),

	render() {
		const { currentTheme, currentThemeId, siteId, siteIdOrWpcom, translate } = this.props,
			placeholderText = <span className="current-theme__placeholder">loading...</span>,
			text = ( currentTheme && currentTheme.name ) ? currentTheme.name : placeholderText;

		const options = pickBy( this.props.options, option =>
			currentTheme && ! ( option.hideForTheme && option.hideForTheme( currentTheme ) )
		);

		return (
			<Card className="current-theme">
				{ siteId && <QueryActiveTheme siteId={ siteId } /> }
				{ currentThemeId && <QueryTheme siteId={ siteIdOrWpcom } themeId={ currentThemeId } /> }
				<div className="current-theme__current">
					<span className="current-theme__label">
						{ translate( 'Current Theme' ) }
					</span>
					<span className="current-theme__name">
						{ text }
					</span>
				</div>
				<div className={ classNames(
					'current-theme__actions',
					{ 'two-buttons': Object.keys( options ).length === 2 }
					) } >
					{ map( options, ( option, name ) => (
						<CurrentThemeButton name={ name }
							key={ name }
							label={ option.label }
							icon={ option.icon }
							href={ currentTheme && option.getUrl( currentTheme ) }
							onClick={ this.trackClick } />
					) ) }
				</div>
			</Card>
		);
	}
} );

const ConnectedCurrentTheme = connectOptions( localize( CurrentTheme ) );

const CurrentThemeWithOptions = ( { siteId, currentTheme, currentThemeId, siteIdOrWpcom } ) => (
	<ConnectedCurrentTheme currentTheme={ currentTheme }
		currentThemeId={ currentThemeId }
		siteIdOrWpcom={ siteIdOrWpcom }
		siteId={ siteId }
		options={ [
			'customize',
			'info',
			'support'
		] }
		source="current theme" />
);

export default connect(
	( state, { siteId } ) => {
		const currentThemeId = getActiveTheme( state, siteId );
		const siteIdOrWpcom = isJetpackSite( state, siteId ) ? siteId : 'wpcom';
		return {
			currentThemeId,
			currentTheme: getTheme( state, siteIdOrWpcom, currentThemeId ),
			siteIdOrWpcom
		};
	}
)( CurrentThemeWithOptions );
