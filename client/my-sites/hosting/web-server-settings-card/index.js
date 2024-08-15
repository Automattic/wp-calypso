import { Button, FormLabel, LoadingPlaceholder } from '@automattic/components';
import styled from '@emotion/styled';
import { localize } from 'i18n-calypso';
import { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import QuerySiteGeoAffinity from 'calypso/components/data/query-site-geo-affinity';
import QuerySitePhpVersion from 'calypso/components/data/query-site-php-version';
import QuerySiteStaticFile404 from 'calypso/components/data/query-site-static-file-404';
import QuerySiteWpVersion from 'calypso/components/data/query-site-wp-version';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSelect from 'calypso/components/forms/form-select';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { HostingCard, HostingCardDescription } from 'calypso/components/hosting-card';
import { useDataCenterOptions } from 'calypso/data/data-center/use-data-center-options';
import { usePhpVersions } from 'calypso/data/php-versions/use-php-versions';
import {
	updateAtomicPhpVersion,
	updateAtomicStaticFile404,
	updateAtomicWpVersion,
} from 'calypso/state/hosting/actions';
import { getAtomicHostingGeoAffinity } from 'calypso/state/selectors/get-atomic-hosting-geo-affinity';
import { getAtomicHostingPhpVersion } from 'calypso/state/selectors/get-atomic-hosting-php-version';
import { getAtomicHostingStaticFile404 } from 'calypso/state/selectors/get-atomic-hosting-static-file-404';
import { getAtomicHostingWpVersion } from 'calypso/state/selectors/get-atomic-hosting-wp-version';
import getRequest from 'calypso/state/selectors/get-request';
import { isFetchingAtomicHostingGeoAffinity } from 'calypso/state/selectors/is-fetching-atomic-hosting-geo-affinity';
import { isFetchingAtomicHostingWpVersion } from 'calypso/state/selectors/is-fetching-atomic-hosting-wp-version';
import isSiteWpcomStaging from 'calypso/state/selectors/is-site-wpcom-staging';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

import './style.scss';

const ParagraphPlaceholder = styled( LoadingPlaceholder )( {
	height: 24,
	width: '85%',
	marginBottom: '1.25em',
} );

const LabelPlaceholder = styled( LoadingPlaceholder )( {
	height: 16,
	width: '80px',
	marginBottom: '.25em',
} );

const InputPlaceholder = styled( LoadingPlaceholder )( {
	height: 24,
	width: '220px',
	marginBottom: '1em',
} );

const WebServerSettingsCard = ( {
	disabled,
	isGettingGeoAffinity,
	isGettingPhpVersion,
	isGettingStaticFile404,
	isGettingWpVersion,
	isUpdatingPhpVersion,
	isUpdatingStaticFile404,
	isUpdatingWpVersion,
	isWpcomStagingSite,
	siteId,
	selectedSiteSlug,
	geoAffinity,
	staticFile404,
	translate,
	updatePhpVersion,
	updateStaticFile404,
	updateWpVersion,
	phpVersion,
	wpVersion,
} ) => {
	const [ selectedPhpVersion, setSelectedPhpVersion ] = useState( '' );
	const [ selectedWpVersion, setSelectedWpVersion ] = useState( '' );
	const [ selectedStaticFile404, setSelectedStaticFile404 ] = useState( '' );
	const { recommendedValue, phpVersions } = usePhpVersions();
	const dataCenterOptions = useDataCenterOptions();

	const wpVersionRef = useRef( null );
	const wpVersionDropdownRef = useRef( null );
	const phpVersionRef = useRef( null );
	const phpVersionDropdownRef = useRef( null );

	const isLoading =
		isGettingGeoAffinity || isGettingPhpVersion || isGettingStaticFile404 || isGettingWpVersion;

	useEffect( () => {
		function scrollTo( hash ) {
			let targetLabel;
			let targetDropdown;

			if ( wpVersionRef.current && hash === '#wp' ) {
				targetLabel = wpVersionRef.current;
				targetDropdown = wpVersionDropdownRef.current;
			} else if ( phpVersionRef.current && hash === '#php' ) {
				targetLabel = phpVersionRef.current;
				targetDropdown = phpVersionDropdownRef.current;
			}

			if ( targetLabel ) {
				const animationKeyframes = [ { color: null }, { color: 'var(--theme-highlight-color)' } ];
				const animationOptions = {
					duration: 500,
					direction: 'alternate',
					easing: 'ease',
					iterations: 6,
				};

				targetLabel.scrollIntoView( { behavior: 'smooth' } );
				targetLabel.animate( animationKeyframes, animationOptions );
				targetDropdown?.animate( animationKeyframes, animationOptions );
			}
		}

		function onClick( event ) {
			const href = window.location.href.replace( window.location.hash, '' );

			if ( event.target instanceof HTMLAnchorElement && event.target.href.startsWith( href ) ) {
				event.preventDefault();
				scrollTo( event.target.hash );
			}
		}

		document.addEventListener( 'click', onClick );
		scrollTo( window.location.hash );

		return () => {
			document.removeEventListener( 'click', onClick );
		};
	}, [ isLoading ] );

	const getWpVersions = () => {
		return [
			{
				label: translate( 'Latest' ),
				value: 'latest',
			},
			{
				label: translate( 'Beta' ),
				value: 'beta',
			},
		];
	};

	const getWpVersionContent = () => {
		if ( isGettingWpVersion ) {
			return;
		}

		const isWpVersionButtonDisabled =
			disabled || ! selectedWpVersion || selectedWpVersion === wpVersion;
		const selectedWpVersionValue = selectedWpVersion || wpVersion || ( disabled && 'latest' );

		return (
			<FormFieldset>
				<FormLabel ref={ wpVersionRef }>{ translate( 'WordPress version' ) }</FormLabel>
				{ isWpcomStagingSite && (
					<>
						<FormSelect
							disabled={ disabled || isUpdatingWpVersion }
							className="web-server-settings-card__wp-version-select"
							onChange={ ( event ) => setSelectedWpVersion( event.target.value ) }
							inputRef={ wpVersionDropdownRef }
							value={ selectedWpVersionValue }
						>
							{ getWpVersions().map( ( option ) => {
								return (
									<option
										disabled={ option.value === wpVersion }
										value={ option.value }
										key={ option.label }
									>
										{ option.label }
									</option>
								);
							} ) }
						</FormSelect>
						{ ! isWpVersionButtonDisabled && (
							<Button
								className="web-server-settings-card__wp-set-version"
								onClick={ () => updateWpVersion( siteId, selectedWpVersion ) }
								busy={ isUpdatingWpVersion }
								disabled={ isUpdatingWpVersion }
							>
								<span>{ translate( 'Update WordPress version' ) }</span>
							</Button>
						) }
					</>
				) }
				{ ! isWpcomStagingSite && (
					<p
						className="web-server-settings-card__wp-version-description"
						ref={ wpVersionDropdownRef }
					>
						{ translate(
							'Every WordPress.com site runs the latest WordPress version. ' +
								'For testing purposes, you can switch to the beta version of the next WordPress release on {{a}}your staging site{{/a}}.',
							{
								components: {
									a: <a href={ `/staging-site/${ selectedSiteSlug }` } />,
								},
							}
						) }
					</p>
				) }
			</FormFieldset>
		);
	};

	const getGeoAffinityContent = () => {
		if ( isGettingGeoAffinity || ! geoAffinity ) {
			return;
		}

		const displayValue =
			dataCenterOptions[ geoAffinity ] !== undefined
				? dataCenterOptions[ geoAffinity ]
				: geoAffinity;

		return (
			<FormFieldset>
				<FormLabel>{ translate( 'Primary Data Center' ) }</FormLabel>
				<FormTextInput
					className="web-server-settings-card__data-center-input"
					value={ displayValue }
					disabled
				/>
				<FormSettingExplanation>
					{ translate(
						'The primary data center is where your site is physically located. ' +
							'For redundancy, your site also replicates in real-time to a second data center in a different region.'
					) }
				</FormSettingExplanation>
			</FormFieldset>
		);
	};

	const changePhpVersion = ( event ) => {
		const newVersion = event.target.value;

		setSelectedPhpVersion( newVersion );
	};

	const updateVersion = () => {
		updatePhpVersion( siteId, selectedPhpVersion );
	};

	const getPhpVersionContent = () => {
		if ( isGettingPhpVersion ) {
			return;
		}

		const isPhpVersionButtonDisabled =
			disabled || ! selectedPhpVersion || selectedPhpVersion === phpVersion;
		const selectedPhpVersionValue =
			selectedPhpVersion || phpVersion || ( disabled && recommendedValue );
		return (
			<FormFieldset>
				<FormLabel ref={ phpVersionRef }>{ translate( 'PHP version' ) }</FormLabel>
				<FormSelect
					disabled={ disabled || isUpdatingPhpVersion }
					className="web-server-settings-card__php-version-select"
					onChange={ changePhpVersion }
					inputRef={ phpVersionDropdownRef }
					value={ selectedPhpVersionValue }
				>
					{ phpVersions.map( ( option ) => {
						// Show disabled PHP version only if the site is still using it.
						if ( option.value !== phpVersion && option.disabled ) {
							return null;
						}

						return (
							<option
								disabled={ option.value === phpVersion }
								value={ option.value }
								key={ option.label }
							>
								{ option.label }
							</option>
						);
					} ) }
				</FormSelect>
				{ ! isPhpVersionButtonDisabled && (
					<Button
						className="web-server-settings-card__php-set-version"
						onClick={ updateVersion }
						busy={ isUpdatingPhpVersion }
						disabled={ isUpdatingPhpVersion }
					>
						<span>{ translate( 'Update PHP version' ) }</span>
					</Button>
				) }
			</FormFieldset>
		);
	};

	const changeStaticFile404 = ( event ) => {
		const newSetting = event.target.value;

		setSelectedStaticFile404( newSetting );
	};

	const applyStaticFile404 = () => updateStaticFile404( siteId, selectedStaticFile404 );

	const getStaticFile404Settings = () => [
		{
			label: translate( 'Default', {
				comment: 'The default way to handle requests for nonexistent static files.',
			} ),
			value: 'default',
		},
		{
			label: translate( 'Send a lightweight File-Not-Found page', {
				comment: 'Respond to requests for nonexistent static files with a simple, fast 404 page',
			} ),
			value: 'lightweight',
		},
		{
			label: translate( 'Delegate request to WordPress', {
				comment: 'Let WordPress handle requests for nonexistent static files',
			} ),
			value: 'wordpress',
		},
	];

	const getStaticFile404Content = () => {
		if ( isGettingStaticFile404 ) {
			return;
		}

		const isStaticFile404ButtonDisabled =
			disabled || ! selectedStaticFile404 || selectedStaticFile404 === staticFile404;
		const selectedStaticFile404Value =
			selectedStaticFile404 || staticFile404 || ( disabled && recommendedValue );

		return (
			<FormFieldset>
				<FormLabel htmlFor="staticFile404Select">
					{ translate( 'Handling requests for nonexistent assets', {
						comment:
							'How the web server handles requests for nonexistent asset files. ' +
							'For example, file types like JavaScript, CSS, and images are considered assets.',
					} ) }
				</FormLabel>
				<FormSelect
					id="staticFile404Select"
					disabled={ disabled || isUpdatingStaticFile404 }
					className="web-server-settings-card__static-file-404-select"
					onChange={ changeStaticFile404 }
					value={ selectedStaticFile404Value }
				>
					{ getStaticFile404Settings().map( ( option ) => {
						return (
							<option
								disabled={ option.value === staticFile404 }
								value={ option.value }
								key={ option.label }
							>
								{ option.label }
							</option>
						);
					} ) }
				</FormSelect>
				<FormSettingExplanation>
					{ translate(
						'Assets are images, fonts, JavaScript, and CSS files that web browsers request as part of ' +
							'loading a web page. This setting controls how the web server handles requests for ' +
							'missing asset files.'
					) }
				</FormSettingExplanation>
				{ ! isStaticFile404ButtonDisabled && (
					<Button
						className="web-server-settings-card__static-file-404-set-setting"
						onClick={ applyStaticFile404 }
						busy={ isUpdatingStaticFile404 }
						disabled={ isUpdatingStaticFile404 }
					>
						<span>
							{ translate( 'Update Handling for Nonexistent Assets', {
								comment:
									'Update the way the web server handles requests for nonexistent asset files',
							} ) }
						</span>
					</Button>
				) }
			</FormFieldset>
		);
	};

	const getPlaceholderContent = () => {
		return (
			<>
				<ParagraphPlaceholder />
				<LabelPlaceholder />
				<InputPlaceholder />
				<LabelPlaceholder />
				<InputPlaceholder />
			</>
		);
	};

	return (
		<HostingCard
			className="web-server-settings-card"
			headingId="web-server-settings"
			title={ translate( 'Web server settings' ) }
		>
			<QuerySiteGeoAffinity siteId={ siteId } />
			<QuerySitePhpVersion siteId={ siteId } />
			<QuerySiteWpVersion siteId={ siteId } />
			<QuerySiteStaticFile404 siteId={ siteId } />
			<HostingCardDescription>
				{ translate(
					'For sites with specialized needs, fine-tune how the web server runs your website.'
				) }
			</HostingCardDescription>
			{ ! isLoading && getWpVersionContent() }
			{ ! isLoading && getGeoAffinityContent() }
			{ ! isLoading && getPhpVersionContent() }
			{ ! isLoading && getStaticFile404Content() }
			{ isLoading && getPlaceholderContent() }
		</HostingCard>
	);
};

export default connect(
	( state, props ) => {
		const siteId = getSelectedSiteId( state );
		const isWpcomStagingSite = isSiteWpcomStaging( state, siteId );
		const geoAffinity = getAtomicHostingGeoAffinity( state, siteId );
		const phpVersion = getAtomicHostingPhpVersion( state, siteId );
		const wpVersion = getAtomicHostingWpVersion( state, siteId );
		const staticFile404 = getAtomicHostingStaticFile404( state, siteId );

		return {
			isGettingGeoAffinity: isFetchingAtomicHostingGeoAffinity( state, siteId ),
			isGettingPhpVersion: ! props.disabled && ! phpVersion,
			isGettingWpVersion: isFetchingAtomicHostingWpVersion( state, siteId ),
			isGettingStaticFile404: ! props.disabled && ! staticFile404,
			isUpdatingPhpVersion:
				getRequest( state, updateAtomicPhpVersion( siteId, null ) )?.isLoading ?? false,
			isUpdatingStaticFile404:
				getRequest( state, updateAtomicStaticFile404( siteId, null ) )?.isLoading ?? false,
			isUpdatingWpVersion:
				getRequest( state, updateAtomicWpVersion( siteId, null ) )?.isLoading ?? false,
			isWpcomStagingSite,
			siteId,
			selectedSiteSlug: getSelectedSiteSlug( state ),
			geoAffinity,
			staticFile404,
			phpVersion,
			wpVersion,
		};
	},
	{
		updatePhpVersion: updateAtomicPhpVersion,
		updateWpVersion: updateAtomicWpVersion,
		updateStaticFile404: updateAtomicStaticFile404,
	}
)( localize( WebServerSettingsCard ) );
