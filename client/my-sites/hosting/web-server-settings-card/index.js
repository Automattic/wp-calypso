import { Button, Card, LoadingPlaceholder } from '@automattic/components';
import styled from '@emotion/styled';
import { localize } from 'i18n-calypso';
import { useState } from 'react';
import { connect } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import QuerySiteGeoAffinity from 'calypso/components/data/query-site-geo-affinity';
import QuerySitePhpVersion from 'calypso/components/data/query-site-php-version';
import QuerySiteStaticFile404 from 'calypso/components/data/query-site-static-file-404';
import QuerySiteWpVersion from 'calypso/components/data/query-site-wp-version';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormSelect from 'calypso/components/forms/form-select';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextInput from 'calypso/components/forms/form-text-input';
import MaterialIcon from 'calypso/components/material-icon';
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
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

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
	siteId,
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

	const isLoading =
		isGettingGeoAffinity || isGettingPhpVersion || isGettingStaticFile404 || isGettingWpVersion;

	const getGeoAffinityContent = () => {
		if ( isGettingGeoAffinity || ! geoAffinity ) {
			return;
		}

		const dataCenterOptions = {
			bur: translate( 'US West (Burbank, California)' ),
			dfw: translate( 'US Central (Dallas-Fort Worth, Texas)' ),
			dca: translate( 'US East (Washington, D.C.)' ),
			ams: translate( 'EU West (Amsterdam, Netherlands)' ),
		};
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

	const recommendedValue = '8.0';

	const changePhpVersion = ( event ) => {
		const newVersion = event.target.value;

		setSelectedPhpVersion( newVersion );
	};

	const updateVersion = () => {
		updatePhpVersion( siteId, selectedPhpVersion );
	};

	const getPhpVersions = () => {
		return [
			{
				label: '7.3',
				value: '7.3',
				disabled: true, // EOL 6th December, 2021
			},
			{
				label: '7.4',
				value: '7.4',
			},
			{
				label: translate( '%s (recommended)', {
					args: '8.0',
					comment: 'PHP Version for a version switcher',
				} ),
				value: recommendedValue,
			},
			{
				label: '8.1',
				value: '8.1',
			},
			{
				label: translate( '%s (experimental)', {
					args: '8.2',
					comment: 'PHP Version for a version switcher',
				} ),
				value: '8.2',
			},
		];
	};

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
				<FormLabel>{ translate( 'PHP version' ) }</FormLabel>
				<FormSelect
					disabled={ disabled || isUpdatingPhpVersion }
					className="web-server-settings-card__php-version-select"
					onChange={ changePhpVersion }
					value={ selectedPhpVersionValue }
				>
					{ getPhpVersions().map( ( option ) => {
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

	const getWpVersionContent = () => {
		if ( isGettingWpVersion ) {
			return;
		}

		const isWpVersionButtonDisabled =
			disabled || ! selectedWpVersion || selectedWpVersion === wpVersion;
		const selectedWpVersionValue =
			selectedWpVersion || wpVersion || ( disabled && recommendedValue );

		return (
			<FormFieldset>
				<FormLabel>{ translate( 'WordPress version' ) }</FormLabel>
				<FormSelect
					disabled={ disabled || isUpdatingPhpVersion }
					className="web-server-settings-card__wp-version-select"
					onChange={ ( event ) => setSelectedWpVersion( event.target.value ) }
					value={ selectedWpVersionValue }
				>
					{ getWpVersions().map( ( option ) => {
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
		<Card className="web-server-settings-card">
			<QuerySiteGeoAffinity siteId={ siteId } />
			<QuerySitePhpVersion siteId={ siteId } />
			<QuerySiteWpVersion siteId={ siteId } />
			<QuerySiteStaticFile404 siteId={ siteId } />
			<MaterialIcon icon="build" size={ 32 } />
			<CardHeading id="web-server-settings">{ translate( 'Web server settings' ) }</CardHeading>
			<p>
				{ translate(
					'For sites with specialized needs, fine-tune how the web server runs your website.'
				) }
			</p>
			{ ! isLoading && getGeoAffinityContent() }
			{ ! isLoading && getPhpVersionContent() }
			{ ! isLoading && getWpVersionContent() }
			{ ! isLoading && getStaticFile404Content() }
			{ isLoading && getPlaceholderContent() }
		</Card>
	);
};

export default connect(
	( state, props ) => {
		const siteId = getSelectedSiteId( state );
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
			siteId,
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
