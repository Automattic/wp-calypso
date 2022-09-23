import { Button, Card, Spinner } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { useState } from 'react';
import { connect } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import QuerySitePhpVersion from 'calypso/components/data/query-site-php-version';
import QuerySiteStaticFile404 from 'calypso/components/data/query-site-static-file-404';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormSelect from 'calypso/components/forms/form-select';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import MaterialIcon from 'calypso/components/material-icon';
import { updateAtomicPhpVersion, updateAtomicStaticFile404 } from 'calypso/state/hosting/actions';
import { getAtomicHostingPhpVersion } from 'calypso/state/selectors/get-atomic-hosting-php-version';
import { getAtomicHostingStaticFile404 } from 'calypso/state/selectors/get-atomic-hosting-static-file-404';
import getRequest from 'calypso/state/selectors/get-request';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

const WebServerSettingsCard = ( {
	disabled,
	isGettingPhpVersion,
	isGettingStaticFile404,
	isUpdatingPhpVersion,
	isUpdatingStaticFile404,
	siteId,
	staticFile404,
	translate,
	updatePhpVersion,
	updateStaticFile404,
	phpVersion,
} ) => {
	const [ selectedPhpVersion, setSelectedPhpVersion ] = useState( '' );
	const [ selectedStaticFile404, setSelectedStaticFile404 ] = useState( '' );

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
				label: translate( '7.3', {
					comment: 'PHP Version for a version switcher',
				} ),
				value: '7.3',
				disabled: true, // EOL 6th December, 2021
			},
			{
				label: translate( '7.4', {
					comment: 'PHP Version for a version switcher',
				} ),
				value: '7.4',
			},
			{
				label: translate( '8.0 (recommended)', {
					comment: 'PHP Version for a version switcher',
				} ),
				value: recommendedValue,
			},
			{
				label: translate( '8.1', {
					comment: 'PHP Version for a version switcher',
				} ),
				value: '8.1',
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
				<FormLabel>{ translate( 'PHP Version' ) }</FormLabel>
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
						<span>{ translate( 'Update PHP Version' ) }</span>
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
					{ translate( 'Handling Requests for Nonexistent Assets', {
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

	return (
		<Card className="web-server-settings-card">
			<QuerySitePhpVersion siteId={ siteId } />
			<QuerySiteStaticFile404 siteId={ siteId } />
			<MaterialIcon icon="build" size={ 32 } />
			<CardHeading>{ translate( 'Web Server Settings' ) }</CardHeading>
			<p>For sites with specialized needs, fine-tune how the web server runs your website.</p>
			{ getPhpVersionContent() }
			{ getStaticFile404Content() }
			{ ( isGettingPhpVersion || isGettingStaticFile404 ) && <Spinner /> }
		</Card>
	);
};

export default connect(
	( state, props ) => {
		const siteId = getSelectedSiteId( state );
		const phpVersion = getAtomicHostingPhpVersion( state, siteId );
		const staticFile404 = getAtomicHostingStaticFile404( state, siteId );

		return {
			isGettingPhpVersion: ! props.disabled && ! phpVersion,
			isGettingStaticFile404: ! props.disabled && ! staticFile404,
			isUpdatingPhpVersion:
				getRequest( state, updateAtomicPhpVersion( siteId, null ) )?.isLoading ?? false,
			isUpdatingStaticFile404:
				getRequest( state, updateAtomicStaticFile404( siteId, null ) )?.isLoading ?? false,
			siteId,
			staticFile404,
			phpVersion,
		};
	},
	{
		updatePhpVersion: updateAtomicPhpVersion,
		updateStaticFile404: updateAtomicStaticFile404,
	}
)( localize( WebServerSettingsCard ) );
