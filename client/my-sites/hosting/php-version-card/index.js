/**
 * External dependencies
 */
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import CardHeading from 'components/card-heading';
import FormSelect from 'components/forms/form-select';
import FormLabel from 'components/forms/form-label';
import MaterialIcon from 'components/material-icon';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getHttpData, requestHttpData } from 'state/data-layer/http-data';
import { http } from 'state/data-layer/wpcom-http/actions';
import Spinner from 'components/spinner';
import { errorNotice, successNotice } from 'state/notices/actions';
import { composeAnalytics, recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';

/**
 * Style dependencies
 */
import './style.scss';

const requestId = ( siteId, method ) => `hosting-php-version-${ method }-${ siteId }`;

export const requestPhpVersion = siteId => {
	const method = 'GET';

	return requestHttpData(
		requestId( siteId, method ),
		http(
			{
				method,
				path: `/sites/${ siteId }/hosting/php-version`,
				apiNamespace: 'wpcom/v2',
				body: {},
			},
			{}
		),
		{
			fromApi: () => version => {
				return [ [ requestId( siteId, method ), version ] ];
			},
			freshness: 0,
		}
	);
};

export const setPhpVersion = ( siteId, version ) => {
	const method = 'POST';

	return requestHttpData(
		requestId( siteId, method ),
		http(
			{
				method,
				path: `/sites/${ siteId }/hosting/php-version`,
				apiNamespace: 'wpcom/v2',
				body: {
					version: version,
				},
			},
			{}
		),
		{
			fromApi: () => success => {
				return [ [ requestId( siteId, method ), success ] ];
			},
			freshness: 0,
		}
	);
};

const PhpVersionCard = ( {
	loading,
	recordHostingPhpVersionUpdate,
	showErrorNotice,
	showSuccessNotice,
	siteId,
	translate,
	updateResult,
	updating,
	version,
} ) => {
	const [ selectedPhpVersion, setSelectedPhpVersion ] = useState( null );
	const [ currentPhpVersion, setCurrentPhpVersion ] = useState( null );

	useEffect( () => {
		requestPhpVersion( siteId );
	}, [ siteId ] );

	useEffect( () => {
		const updateNoticeId = 'hosting-php-version';

		if ( updateResult === 'failure' ) {
			showErrorNotice( translate( 'Failed to set PHP version.' ), {
				id: updateNoticeId,
			} );
		}

		if ( updateResult === 'success' ) {
			setCurrentPhpVersion( selectedPhpVersion );

			showSuccessNotice(
				translate( 'PHP version successfully set to %(version)s.', {
					args: {
						version: selectedPhpVersion,
					},
				} ),
				{
					id: updateNoticeId,
					showDismiss: false,
					duration: 5000,
				}
			);
		}

		if ( [ 'success', 'failure' ].includes( updateResult ) ) {
			recordHostingPhpVersionUpdate( selectedPhpVersion, updateResult );
		}
	}, [ updateResult ] );

	useEffect( () => {
		setCurrentPhpVersion( version );
	}, [ version ] );

	const changePhpVersion = event => {
		const newVersion = event.target.value;

		setSelectedPhpVersion( newVersion );
	};

	const getPhpVersions = () => {
		return [
			{
				label: translate( '7.2', {
					comment: 'PHP Version for a version switcher',
				} ),
				value: '7.2',
			},
			{
				label: translate( '7.3 (recommended)', {
					comment: 'PHP Version for a version switcher',
				} ),
				value: '7.3',
			},
			{
				label: translate( '7.4RC6', {
					comment: 'PHP Version for a version switcher',
				} ),
				value: '7.4',
			},
		];
	};

	const getContent = () => {
		if ( loading ) {
			return;
		}

		const isButtonDisabled = ! selectedPhpVersion || selectedPhpVersion === currentPhpVersion;

		return (
			<div>
				<div>
					<FormLabel>{ translate( 'Your site is currently running:' ) }</FormLabel>
					<FormSelect
						className="php-version-card__version-select"
						onChange={ changePhpVersion }
						value={ selectedPhpVersion || currentPhpVersion }
					>
						{ getPhpVersions().map( option => {
							return (
								<option
									disabled={ option.value === currentPhpVersion }
									value={ option.value }
									key={ option.label }
								>
									{ option.label }
								</option>
							);
						} ) }
					</FormSelect>
				</div>
				{ ! isButtonDisabled && (
					<Button
						className="php-version-card__set-version"
						onClick={ () => setPhpVersion( siteId, selectedPhpVersion ) }
						busy={ updating }
					>
						<span>{ translate( 'Update PHP Version' ) }</span>
					</Button>
				) }
			</div>
		);
	};

	return (
		<Card className="php-version-card">
			<MaterialIcon icon="build" size={ 32 } />
			<CardHeading>{ translate( 'PHP Version' ) }</CardHeading>
			{ getContent() }
			{ loading && <Spinner /> }
		</Card>
	);
};

export const recordHostingPhpVersionUpdate = ( version, result ) =>
	composeAnalytics(
		recordGoogleEvent(
			'Hosting Configuration',
			'Clicked "Update PHP Version" Button in PHP Version box',
			`PHP Version Update ${ result }`,
			version
		),
		recordTracksEvent( 'calypso_hosting_configuration_php_version_update', {
			result,
			version,
		} )
	);

export default connect(
	state => {
		const siteId = getSelectedSiteId( state );

		const phpVersionGet = getHttpData( requestId( siteId, 'GET' ) );
		const phpVersionUpdate = getHttpData( requestId( siteId, 'POST' ) );
		const version = phpVersionGet?.data ?? null;

		return {
			loading: ! version && phpVersionGet.state === 'pending',
			siteId,
			updating: phpVersionUpdate.state === 'pending',
			updateResult: phpVersionUpdate.state,
			version,
		};
	},
	{
		recordHostingPhpVersionUpdate,
		showErrorNotice: errorNotice,
		showSuccessNotice: successNotice,
	}
)( localize( PhpVersionCard ) );
