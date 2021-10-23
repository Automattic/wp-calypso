import { Card, Button, Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { localize, TranslateResult } from 'i18n-calypso';
import { map, pickBy } from 'lodash';
import { Component, MouseEvent } from 'react';
import { connect } from 'react-redux';
import Badge from 'calypso/components/badge';
import QueryActiveTheme from 'calypso/components/data/query-active-theme';
import QueryCanonicalTheme from 'calypso/components/data/query-canonical-theme';
import InlineSupportLink from 'calypso/components/inline-support-link';
import withBlockEditorSettings from 'calypso/data/block-editor/with-block-editor-settings';
import { isFullSiteEditingTheme } from 'calypso/my-sites/themes/is-full-site-editing-theme';
import { getActiveTheme, getCanonicalTheme } from 'calypso/state/themes/selectors';
import { Theme } from 'calypso/types';
import { trackClick } from '../helpers';
import { connectOptions } from '../theme-options';

import './style.scss';

interface CurrentThemeProps {
	blockEditorSettings: {
		is_fse_eligible: boolean;
	};
	currentTheme: Theme | null;
	currentThemeId: string | null;
	name: string;
	options: {
		[ key: string ]: {
			action?: () => void;
			extendedLabel?: string;
			getUrl?: ( currentThemeId: string | null ) => string;
			header?: string;
			hideForTheme?: ( currentThemeId: string | null, siteId: number ) => boolean;
			label: string;
			icon?: string;
		};
	};
	siteId: number;
	translate: ( original: string ) => TranslateResult;
}

/*
 * Show current active theme for a site, with
 * related actions.
 */
class CurrentTheme extends Component< CurrentThemeProps > {
	trackClick = ( event: MouseEvent< HTMLButtonElement > ) => trackClick( 'current theme', event );

	render() {
		const { currentTheme, currentThemeId, blockEditorSettings, siteId, translate } = this.props;
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
		const isFSEEligible = blockEditorSettings?.is_fse_eligible ?? false;
		const showBetaBadge = isFullSiteEditingTheme( currentTheme ) && isFSEEligible;

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
									<div className="current-theme__badge-wrapper">
										{ showBetaBadge && (
											<Badge type="warning-clear" className="current-theme__badge-beta">
												{ translate( 'Beta' ) }
											</Badge>
										) }
										<span className="current-theme__label">
											{ currentTheme && currentTheme.name && translate( 'Current Theme' ) }
										</span>
									</div>
									<span className="current-theme__name">{ text }</span>
								</div>
								<div className="current-theme__content-wrapper">
									<p>
										{ translate( 'This is the active theme on your site.' ) }{ ' ' }
										<InlineSupportLink supportContext="themes-switch">
											{ translate( 'Learn more.' ) }
										</InlineSupportLink>
									</p>
									<div className={ classNames( 'current-theme__actions' ) }>
										{ map( options, ( option, name ) => {
											return (
												<Button
													className={ classNames(
														'current-theme__button',
														'components-button',
														'current-theme__' + this.props.name
													) }
													primary={ option.label.toLowerCase() === 'customize' }
													name={ name }
													key={ name }
													href={
														currentThemeId && option.getUrl ? option.getUrl( currentThemeId ) : ''
													}
													onClick={ this.trackClick }
												>
													{ option.icon && <Gridicon icon={ option.icon } size={ 18 } /> }
													{ option.label }
												</Button>
											);
										} ) }
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</Card>
		);
	}
}

const ConnectedCurrentTheme = connectOptions( localize( CurrentTheme ) );
const CurrentThemeWithEditorSettings = withBlockEditorSettings( ConnectedCurrentTheme );

const CurrentThemeWithOptions = ( {
	siteId,
	currentTheme,
	currentThemeId,
}: {
	currentTheme: Theme | null;
	currentThemeId: string | null;
	siteId: number;
} ) => (
	<CurrentThemeWithEditorSettings
		currentTheme={ currentTheme }
		currentThemeId={ currentThemeId }
		siteId={ siteId }
		source="current theme"
	/>
);

export default connect( ( state, { siteId }: { siteId: number } ) => {
	const currentThemeId = getActiveTheme( state, siteId );
	return {
		currentThemeId,
		currentTheme: getCanonicalTheme( state, siteId, currentThemeId ),
	};
} )( CurrentThemeWithOptions );
