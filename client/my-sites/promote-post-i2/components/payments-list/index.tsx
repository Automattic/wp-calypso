import './style.scss';
import { CALYPSO_CONTACT } from '@automattic/urls';
import { Spinner } from '@wordpress/components';
import { translate, useTranslate } from 'i18n-calypso';
import React from 'react';
import Notice from 'calypso/components/notice';
import { Payment } from 'calypso/data/promote-post/use-promote-post-payments-query';
import EmptyPromotionList from 'calypso/my-sites/promote-post-i2/components/empty-promotion-list';
import { DSPMessage } from 'calypso/my-sites/promote-post-i2/main';
import PaymentItem from '../payment-item';
import PaymentsFilter from '../payments-filter';
import { DropdownOption } from '../search-bar';

type Props = {
	isLoading: boolean;
	isFetching: boolean;
	isError: DSPMessage | null;
	payments?: Payment[];
	selectedPaymentsFilter: boolean;
	setFetchPaymentsForCurrentSite: ( flag: boolean ) => void;
};

const fetchErrorListMessage = translate(
	'There was a problem obtaining the payments list. Please try again or {{contactSupportLink}}contact support{{/contactSupportLink}}.',
	{
		components: {
			contactSupportLink: <a href={ CALYPSO_CONTACT } />,
		},
		comment: 'Validation error fetching payment info',
	}
);

export default function PaymentsList( props: Props ) {
	const {
		isLoading,
		isFetching,
		isError,
		payments,
		selectedPaymentsFilter,
		setFetchPaymentsForCurrentSite,
	} = props;
	const translate = useTranslate();

	type PaymentColumn = {
		key: string;
		title: string;
	};

	const getHeaderColumns = (): PaymentColumn[] => {
		return [
			{
				key: 'payment-id',
				title: translate( 'Payment' ),
			},
			{
				key: 'status',
				title: translate( 'Status' ),
			},
			{
				key: 'date',
				title: translate( 'Date issued' ),
			},
			{
				key: 'subtotal',
				title: translate( 'Subtotal' ),
			},
			{
				key: 'credits',
				title: translate( 'Credits' ),
			},
			{
				key: 'total',
				title: translate( 'Total paid' ),
			},
			{
				key: 'actions',
				title: '',
			},
		];
	};

	const paymentFilterOptions: Array< DropdownOption > = [
		{
			value: 'currentSite',
			label: translate( 'Current site' ),
		},
		{
			value: 'unified',
			label: translate( 'All Sites' ),
		},
	];

	if ( isError ) {
		return (
			<Notice
				className="promote-post-notice promote-post-i2__aux-wrapper"
				status="is-error"
				icon="mention"
				showDismiss={ false }
			>
				{ fetchErrorListMessage }
			</Notice>
		);
	}

	return (
		<>
			<PaymentsFilter
				options={ paymentFilterOptions }
				paymentsFilter={ selectedPaymentsFilter ? 'currentSite' : 'unified' }
				handleChangeFilter={ ( event ) => {
					setFetchPaymentsForCurrentSite( event );
				} }
			/>
			{ ! isLoading && payments?.length === 0 ? (
				<div className="promote-post-i2__aux-wrapper">
					<EmptyPromotionList type="payments" />
				</div>
			) : (
				<>
					{ isFetching ? (
						<div className="promote-post-i2__aux-wrapper">
							<div className="payments-list__loading">
								<Spinner />
								<p>{ translate( 'Please wait. Loading payments.' ) }</p>
							</div>
						</div>
					) : (
						<>
							{ selectedPaymentsFilter && (
								<div className="promote-post-i2__aux-wrapper">
									<p className="payments-list__info">
										{ translate(
											'If you share the payment method across multiple sites, you may see a cost breakdown for those here too.'
										) }
									</p>
								</div>
							) }
							<table className="promote-post-i2__table payments-list__table">
								<thead>
									<tr>
										{ getHeaderColumns().map( ( item, key ) => (
											<th className={ `payment-item__${ item.key }` } key={ key }>
												{ item.title }
											</th>
										) ) }
									</tr>
								</thead>
								<tbody>
									{ payments?.map( ( payment ) => (
										<PaymentItem payment={ payment } key={ payment.id } />
									) ) }
								</tbody>
							</table>
						</>
					) }
				</>
			) }
		</>
	);
}
