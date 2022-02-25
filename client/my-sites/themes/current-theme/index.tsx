import { Card, Button, Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { localize, TranslateResult } from 'i18n-calypso';
import { map, pickBy } from 'lodash';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryActiveTheme from 'calypso/components/data/query-active-theme';
import QueryCanonicalTheme from 'calypso/components/data/query-canonical-theme';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { getActiveTheme, getCanonicalTheme } from 'calypso/state/themes/selectors';
import { IAppState } from 'calypso/state/types';
import { CanonicalTheme } from 'calypso/types';
import { trackClick } from '../helpers';
import { connectOptions } from '../theme-options';

import './style.scss';

interface Option {
	action?: () => void;
	extendedLabel?: string;
	getUrl?: ( currentThemeId: string | null ) => string;
	header?: string;
	hideForTheme?: ( currentThemeId: string | null, siteId: number ) => boolean;
	label: string;
	icon?: string;
}

interface CurrentThemeProps {
	currentTheme: CanonicalTheme | null;
	currentThemeId: string | null;
	name: string;
	options: Record< string, Option >;
	siteId: number;
	translate: ( original: string ) => TranslateResult;
}

/*
 * Show current active theme for a site, with
 * related actions.
 */
class CurrentTheme extends Component< CurrentThemeProps > {
	trackClick = ( eventName: string ) => () => {
		trackClick( 'current theme', eventName );
	};

	render() {
		const { currentTheme, currentThemeId, siteId, translate } = this.props;
		const placeholderText = <span className="current-theme__placeholder">loading...</span>;
		const text = currentTheme && currentTheme.name ? currentTheme.name : placeholderText;
		const description = currentTheme && currentTheme.description ? currentTheme.description : '';

		const options = pickBy(
			this.props.options,
			( option ) =>
				option.icon && ! ( option.hideForTheme && option.hideForTheme( currentThemeId, siteId ) )
		);

		const showScreenshot = currentTheme && currentTheme.screenshot;
		// Some themes have no screenshot, so only show placeholder until details loaded
		const showScreenshotPlaceholder = ! currentTheme;

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
									src={ currentTheme.screenshot + '&w=420' }
									className="current-theme__img"
									alt=""
								/>
							) }
							<div className="current-theme__description">
								<div className="current-theme__title-wrapper">
									<div className="current-theme__badge-wrapper">
										<span className="current-theme__label">
											{ currentTheme && currentTheme.name && translate( 'Current Theme' ) }
										</span>
									</div>
									<span className="current-theme__name">{ text }</span>
								</div>
								<div className="current-theme__content-wrapper">
									<p className="current-theme__content-learn-more">
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
													primary={ name === 'customize' }
													name={ name }
													key={ name }
													href={
														currentThemeId && option.getUrl ? option.getUrl( currentThemeId ) : ''
													}
													onClick={ this.trackClick( name ) }
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
						<div className="current-theme__more-info">
							<p className="current-theme__theme-description">
								<span>{ description }</span>
							</p>
							{ options?.info && options?.info?.getUrl && (
								<a
									className="current-theme__theme-description-link"
									href={ options.info.getUrl( currentThemeId ) }
									onClick={ this.trackClick( 'read more link' ) }
								>
									{ translate( 'Read more' ) }
								</a>
							) }

							{ options?.customize && options?.customize?.getUrl && (
								<a
									className="current-theme__theme-customize"
									href={ options.customize.getUrl( currentThemeId ) }
									onClick={ this.trackClick( 'customize theme link' ) }
								>
									{ options?.customize?.icon && (
										<Gridicon icon={ options.customize.icon } size={ 24 } />
									) }
									<span>{ translate( 'Customize theme' ) }</span>
									<Gridicon icon="chevron-right" size={ 24 } />
								</a>
							) }
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
}: {
	currentTheme: CanonicalTheme | null;
	currentThemeId: string | null;
	siteId: number;
} ) => (
	<ConnectedCurrentTheme
		currentTheme={ currentTheme }
		currentThemeId={ currentThemeId }
		siteId={ siteId }
		source="current theme"
	/>
);

export default connect( ( state: IAppState, { siteId }: { siteId: number } ) => {
	const currentThemeId = getActiveTheme( state, siteId );
	return {
		currentThemeId,
		currentTheme: getCanonicalTheme( state, siteId, currentThemeId ),
	};
} )( CurrentThemeWithOptions );
