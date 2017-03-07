/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { get, map, pickBy } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import CurrentThemeButton from './button';
import { connectOptions } from '../theme-options';
import { trackClick } from '../helpers';
import { getActiveTheme, getCanonicalTheme } from 'state/themes/selectors';
import QueryActiveTheme from 'components/data/query-active-theme';
import QueryCanonicalTheme from 'components/data/query-canonical-theme';

/**
 * Show current active theme for a site, with
 * related actions.
 */
class CurrentTheme extends Component {

	static propTypes = {
		options: PropTypes.objectOf( PropTypes.shape( {
			label: PropTypes.string.isRequired,
			icon: PropTypes.string.isRequired,
			getUrl: PropTypes.func.isRequired
		} ) ),
		siteId: PropTypes.number.isRequired,
		// connected props
		currentThemeId: PropTypes.string,
		currentThemeName: PropTypes.string
	}

	trackClick = ( event ) => trackClick( 'current theme', event )

	render() {
		const { currentThemeId, currentThemeName, siteId, translate } = this.props,
			placeholderText = <span className="current-theme__placeholder">loading...</span>,
			text = currentThemeName || placeholderText;

		const options = pickBy( this.props.options, option =>
			currentThemeId && ! ( option.hideForTheme && option.hideForTheme( currentThemeId, siteId ) )
		);

		return (
			<Card className="current-theme">
				{ siteId && <QueryActiveTheme siteId={ siteId } /> }
				{ currentThemeId && <QueryCanonicalTheme themeId={ currentThemeId } siteId={ siteId } /> }
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
							href={ currentThemeId && option.getUrl( currentThemeId ) }
							onClick={ this.trackClick } />
					) ) }
				</div>
			</Card>
		);
	}
}

const ConnectedCurrentTheme = connectOptions( localize( CurrentTheme ) );

const CurrentThemeWithOptions = ( { siteId, currentThemeId, currentThemeName } ) => (
	<ConnectedCurrentTheme
		currentThemeId={ currentThemeId }
		currentThemeName={ currentThemeName }
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
		const currentTheme = getCanonicalTheme( state, siteId, currentThemeId );
		return {
			currentThemeId,
			currentThemeName: get( currentTheme, 'name' ),
		};
	}
)( CurrentThemeWithOptions );
