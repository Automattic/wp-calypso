/**
 * External dependencies
 */
import React from 'react';
import { useI18n } from '@automattic/react-i18n';
import { Icon } from '@wordpress/components';

/**
 * Internal dependencies
 */
import './style.scss';
import { mockDetails, MockPlanFeature, MockPlanDetail } from '../mock-data';

const PlansDetails: React.FunctionComponent = () => {
	const { __ } = useI18n();

	return (
		<table className="plans-details">
			<thead>
				<tr className="plans-details__header-row">
					<th>{ __( 'Feature' ) }</th>
					<th>{ __( 'Free' ) }</th>
					<th>{ __( 'Personal' ) }</th>
					<th>{ __( 'Premium' ) }</th>
					<th>{ __( 'Business' ) }</th>
					<th>{ __( 'Commerce' ) }</th>
				</tr>
			</thead>
			{ mockDetails.map( ( detail: MockPlanDetail ) => (
				<tbody key={ detail.id }>
					{ detail.name && (
						<tr className="plans-details__header-row">
							<th colSpan={ 6 }>{ detail.name }</th>
						</tr>
					) }
					{ detail.features.map( ( feature: MockPlanFeature, i ) => (
						<tr className="plans-details__feature-row" key={ i }>
							<th>{ feature.name }</th>
							{ feature.data.map( ( value, j ) => (
								<td key={ j }>
									{ feature.type === 'checkbox' &&
										( value ? (
											<>
												{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace */ }
												<span className="hidden">{ __( 'Available' ) }</span>
												<Icon icon="yes-alt" />
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
	);
};

export default PlansDetails;
