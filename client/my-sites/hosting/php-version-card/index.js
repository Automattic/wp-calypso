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
import { updateAtomicPhpVersion } from 'state/hosting/actions';
import { getAtomicHostingPhpVersion } from 'state/selectors/get-atomic-hosting-php-version';

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

const PhpVersionCard = ( {
	disabled,
	loading,
	siteId,
	translate,
	updating,
	updatePhpVersion,
	version,
} ) => {
	const [ selectedPhpVersion, setSelectedPhpVersion ] = useState( '' );
	const [ currentPhpVersion, setCurrentPhpVersion ] = useState( '' );

	const recommendedValue = '7.3';

	useEffect( () => {
		if ( ! disabled ) {
			requestPhpVersion( siteId );
		}
	}, [ siteId, disabled ] );

	useEffect( () => {
		setCurrentPhpVersion( version );
	}, [ version ] );

	const changePhpVersion = event => {
		const newVersion = event.target.value;

		setSelectedPhpVersion( newVersion );
	};

	const updateVersion = () => {
		updatePhpVersion( siteId, selectedPhpVersion );
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
				value: recommendedValue,
			},
			{
				label: translate( '7.4', {
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

		const isButtonDisabled =
			disabled || ! selectedPhpVersion || selectedPhpVersion === currentPhpVersion;

		const selectedValue =
			selectedPhpVersion || currentPhpVersion || ( disabled && recommendedValue );

		return (
			<div>
				<div>
					<FormLabel>{ translate( 'Your site is currently running:' ) }</FormLabel>
					<FormSelect
						disabled={ disabled }
						className="php-version-card__version-select"
						onChange={ changePhpVersion }
						value={ selectedValue }
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
						onClick={ updateVersion }
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

export default connect(
	( state, props ) => {
		const siteId = getSelectedSiteId( state );

		const phpVersionGet = getHttpData( requestId( siteId, 'GET' ) );
		const phpVersionUpdate = getHttpData( requestId( siteId, 'POST' ) );
		const version = getAtomicHostingPhpVersion( state, siteId ) || ( phpVersionGet?.data ?? '' );

		console.log( getAtomicHostingPhpVersion( state, siteId ) );

		return {
			loading: ! props.disabled && ! version && phpVersionGet.state === 'pending',
			siteId,
			updating: phpVersionUpdate.state === 'pending',
			updateResult: phpVersionUpdate.state,
			version,
		};
	},
	{
		updatePhpVersion: updateAtomicPhpVersion,
		showErrorNotice: errorNotice,
		showSuccessNotice: successNotice,
	}
)( localize( PhpVersionCard ) );
