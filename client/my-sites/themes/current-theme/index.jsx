import { Card, Button, Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { map, pickBy } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import Badge from 'calypso/components/badge';
import QueryActiveTheme from 'calypso/components/data/query-active-theme';
import QueryCanonicalTheme from 'calypso/components/data/query-canonical-theme';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { isFullSiteEditingTheme } from 'calypso/my-sites/themes/is-full-site-editing-theme';
import isSiteUsingCoreSiteEditorSelector from 'calypso/state/selectors/is-site-using-core-site-editor';
import { getActiveTheme, getCanonicalTheme } from 'calypso/state/themes/selectors';
import { trackClick } from '../helpers';
import { connectOptions } from '../theme-options';

import './style.scss';

/*
 * Show current active theme for a site, with
 * related actions.
 */
class CurrentTheme extends Component {
	static propTypes = {
		options: PropTypes.objectOf(
			PropTypes.shape( {
				label: PropTypes.string,
				icon: PropTypes.string,
				getUrl: PropTypes.func,
			} )
		),
		siteId: PropTypes.number.isRequired,
		// connected props
		currentTheme: PropTypes.object,
	};

	trackClick = ( event ) => trackClick( 'current theme', event );

	render() {
		const {
			currentTheme,
			currentThemeId,
			isSiteUsingCoreSiteEditor,
			siteId,
			translate,
		} = this.props;
		const placeholderText = <span className="current-theme__placeholder">loading...</span>;
		const text = currentTheme && currentTheme.name ? currentTheme.name : placeholderText;

		const options = pickBy(
			this.props.options,
			( option ) =>
				option.icon && ! ( option.hideForTheme && option.hideForTheme( currentThemeId, siteId ) )
		);

		const showScreenshot = currentTheme && currentTheme.screenshot;
		// Some themes have no screenshot, so only show placeholder until details loaded
		const showScreenshotPlaceholder = ! currentTheme;
		const showBetaBadge = isFullSiteEditingTheme( currentTheme ) && isSiteUsingCoreSiteEditor;

		return (
			<Card className="current-theme">
				<QueryActiveTheme siteId={ siteId } />
				{ currentThemeId && <QueryCanonicalTheme themeId={ currentThemeId } siteId={ siteId } /> }
				<div className="current-theme__post-revamp">
					<div className="current-theme__current">
						<div className="current-theme__details">
							{ showScreenshotPlaceholder && <div className="current-theme__img-placeholder" /> }
							{ showScreenshot && (
								<img
									src={ currentTheme.screenshot + '?w=150' }
									className="current-theme__img"
									alt=""
								/>
							) }
							<div className="current-theme__description">
								<div className="current-theme__title-wrapper">
									{ showBetaBadge && (
										<Badge type="warning-clear" className="current-theme__badge-beta">
											{ translate( 'Beta' ) }
										</Badge>
									) }
									<span className="current-theme__label">
										{ currentTheme && currentTheme.name && translate( 'Current Theme' ) }
									</span>
									<span className="current-theme__name">{ text }</span>
								</div>
								<p>
									{ translate( 'This is the active theme on your site.' ) }{ ' ' }
									<InlineSupportLink supportContext="themes-switch">
										{ translate( 'Learn more.' ) }
									</InlineSupportLink>
								</p>
							</div>
						</div>
						<div className={ classNames( 'current-theme__actions' ) }>
							{ map( options, ( option, name ) => (
								<Button
									className={ classNames(
										'current-theme__button',
										'components-button',
										'current-theme__' + this.props.name
									) }
									primary={ option.label.toLowerCase() === 'customize' }
									name={ name }
									key={ name }
									label={ option.label }
									href={ currentThemeId && option.getUrl( currentThemeId ) }
									onClick={ this.trackClick }
								>
									{ option.icon && <Gridicon icon={ option.icon } size={ 18 } /> }
									{ option.label }
								</Button>
							) ) }
						</div>
					</div>
				</div>
			</Card>
		);
	}
}

const ConnectedCurrentTheme = connectOptions( localize( CurrentTheme ) );

const CurrentThemeWithOptions = ( {
	siteId,
	currentTheme,
	currentThemeId,
	isSiteUsingCoreSiteEditor,
} ) => (
	<ConnectedCurrentTheme
		currentTheme={ currentTheme }
		currentThemeId={ currentThemeId }
		isSiteUsingCoreSiteEditor={ isSiteUsingCoreSiteEditor }
		siteId={ siteId }
		source="current theme"
	/>
);

export default connect( ( state, { siteId } ) => {
	const currentThemeId = getActiveTheme( state, siteId );
	return {
		currentThemeId,
		currentTheme: getCanonicalTheme( state, siteId, currentThemeId ),
		isSiteUsingCoreSiteEditor: isSiteUsingCoreSiteEditorSelector( state, siteId ),
	};
} )( CurrentThemeWithOptions );
