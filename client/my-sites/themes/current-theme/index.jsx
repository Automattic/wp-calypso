/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import CurrentThemeButton from './button';
import {
	getCustomizeUrl,
	getDetailsUrl,
	getSupportUrl,
	isPremium,
	trackClick
} from '../helpers';
import { getCurrentTheme } from 'state/themes/current-theme/selectors';
import QueryCurrentTheme from 'components/data/query-current-theme';

/**
 * Show current active theme for a site, with
 * related actions.
 */
const CurrentTheme = React.createClass( {

	propTypes: {
		currentTheme: React.PropTypes.object,
		site: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired,
		canCustomize: React.PropTypes.bool.isRequired
	},

	trackClick: trackClick.bind( null, 'current theme' ),

	render() {
		const { currentTheme, site } = this.props,
			placeholderText = <span className="current-theme__placeholder">loading...</span>,
			text = ( currentTheme && currentTheme.name ) ? currentTheme.name : placeholderText,
			displaySupportButton = isPremium( currentTheme ) && ! site.jetpack;

		return (
			<Card className="current-theme">
				{ site && <QueryCurrentTheme siteId={ site.ID }/> }
				<div className="current-theme__current">
					<span className="current-theme__label">
						{ this.translate( 'Current Theme' ) }
					</span>
					<span className="current-theme__name">
						{ text }
					</span>
				</div>
				<div className={ classNames(
					'current-theme__actions',
					{ 'two-buttons': ! displaySupportButton }
					) } >
					<CurrentThemeButton name="customize"
						label={ this.translate( 'Customize' ) }
						noticon="paintbrush"
						href={ this.props.canCustomize ? getCustomizeUrl( null, site ) : null }
						onClick={ this.trackClick } />
					<CurrentThemeButton name="info"
						label={ this.translate( 'Info' ) }
						noticon="info"
						href={ currentTheme ? getDetailsUrl( currentTheme, site ) : null }
						onClick={ this.trackClick } />
					{ displaySupportButton && <CurrentThemeButton name="support"
						label={ this.translate( 'Setup' ) }
						noticon="help"
						href={ currentTheme ? getSupportUrl( currentTheme, site ) : null }
						onClick={ this.trackClick } /> }
				</div>
			</Card>
		);
	}
} );

export default connect(
	( state, props ) => (
		{ currentTheme: getCurrentTheme( state, props.site && props.site.ID ) }
	)
)( CurrentTheme );
