/**
 * External dependencies
 */
import React from 'react';
import { useI18n } from '@automattic/react-i18n';
import { Path, SVG } from '@wordpress/primitives';
import { Icon } from '@wordpress/icons';
import { Plans } from '@automattic/data-stores';
import { useSelect } from '@wordpress/data';
/**
 * Internal dependencies
 */
import './style.scss';

const PLANS_STORE = Plans.STORE_KEY;

const PlansDetails: React.FunctionComponent = ( props ) => {
	const plansDetails = useSelect( ( select ) => select( PLANS_STORE ).getPlansDetails() );

	const { __ } = useI18n();

	const checkIcon = (
		<SVG width="20" height="20" viewBox="0 0 20 20">
			<Path d="M10 2c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm-.615 12.66h-1.34l-3.24-4.54 1.34-1.25 2.57 2.4 5.14-5.93 1.34.94-5.81 8.38z" />
		</SVG>
	);

	return (
		<div className="plans-details">
			<table className="plans-details__table">
				<thead>
					<tr className="plans-details__header-row">
						<th>{ __( 'Feature' ) }</th>
						<th>{ __( 'Free' ) }</th>
						<th>{ __( 'Personal' ) }</th>
						<th>{ __( 'Premium' ) }</th>
						<th>{ __( 'Business' ) }</th>
						<th>{ __( 'eCommerce' ) }</th>
					</tr>
				</thead>
				{ plansDetails.map( ( detail ) => (
					<tbody key={ detail.id }>
						{ detail.name && (
							<tr className="plans-details__header-row">
								<th colSpan={ 6 }>{ detail.name }</th>
							</tr>
						) }
						{ detail.features.map( ( feature, i ) => (
							<tr className="plans-details__feature-row" key={ i }>
								<th>{ feature.name }</th>
								{ feature.data.map( ( value, j ) => (
									<td key={ j }>
										{ feature.type === 'checkbox' &&
											( value ? (
												<>
													{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace */ }
													<span className="hidden">{ __( 'Available' ) }</span>
													<Icon icon={ checkIcon } size={ 20 } />
												</>
											) : (
												<>
													{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace */ }
													<span className="hidden">{ __( 'Unavailable' ) } </span>
												</>
											) ) }
										{ feature.type === 'text' && value }
									</td>
								) ) }
							</tr>
						) ) }
					</tbody>
				) ) }
			</table>
			{ props.children }
		</div>
	);
};

export default PlansDetails;
