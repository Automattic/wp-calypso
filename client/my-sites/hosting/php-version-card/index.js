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
import Spinner from 'components/spinner';
import { getAtomicPhpVersion, updateAtomicPhpVersion } from 'state/hosting/actions';
import { getAtomicHostingPhpVersion } from 'state/selectors/get-atomic-hosting-php-version';
import { isUpdatingAtomicPhpVersion } from 'state/selectors/is-updating-atomic-php-version';

/**
 * Style dependencies
 */
import './style.scss';

const PhpVersionCard = ( {
	disabled,
	getPhpVersion,
	isBusy,
	loading,
	siteId,
	translate,
	updatePhpVersion,
	version,
} ) => {
	const [ selectedPhpVersion, setSelectedPhpVersion ] = useState( '' );

	const recommendedValue = '7.3';

	useEffect( () => {
		if ( ! disabled ) {
			getPhpVersion( siteId );
		}
	}, [ disabled, getPhpVersion, siteId ] );

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

		const isButtonDisabled = disabled || ! selectedPhpVersion || selectedPhpVersion === version;
		const selectedValue = selectedPhpVersion || version || ( disabled && recommendedValue );

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
									disabled={ option.value === version }
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
						busy={ isBusy }
						disabled={ isBusy }
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
		const version = getAtomicHostingPhpVersion( state, siteId );

		return {
			isBusy: isUpdatingAtomicPhpVersion( state, siteId ),
			loading: ! props.disabled && ! version,
			siteId,
			version,
		};
	},
	{
		getPhpVersion: getAtomicPhpVersion,
		updatePhpVersion: updateAtomicPhpVersion,
	}
)( localize( PhpVersionCard ) );
