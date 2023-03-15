import { Button, Gridicon } from '@automattic/components';
import { PureComponent } from 'react';
import upsellImage from 'calypso/assets/images/checkout-upsell/upsell-rocket-2.png';
import DocumentHead from 'calypso/components/data/document-head';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';

import './style.scss';

export class BusinessPlanUpgradeUpsellTreatment extends PureComponent {
	constructor( props ) {
		super( props );
		this.state = { hours: 0, minutes: 0, seconds: 0 };
	}

	componentDidMount() {
		const subscribedDate = this.props.currentPlan?.subscribedDate;
		const discountEndDate = this.getUnixTimestamp( subscribedDate ) + 24 * 60 * 60; // add 24 hours

		this.getDiscountTimeRemaining( discountEndDate );
		this.timerID = setInterval( () => this.getDiscountTimeRemaining( discountEndDate ), 1000 );
	}

	componentWillUnmount() {
		clearInterval( this.timerID );
	}

	getUnixTimestamp( timestamp ) {
		const date = timestamp ? new Date( Date.parse( timestamp ) ) : new Date();
		return Math.floor( date.getTime() / 1000 ); // divide by 1000 to get seconds instead of milliseconds
	}

	getDiscountTimeRemaining( discountEndDate ) {
		const timeDiff = discountEndDate - this.getUnixTimestamp();
		if ( timeDiff <= 0 ) {
			clearInterval( this.timerID );
			this.setState( {
				hours: 0,
				minutes: 0,
				seconds: 0,
			} );
			return;
		}

		this.setState( {
			hours: Math.floor( ( timeDiff / ( 60 * 60 ) ) % 24 ),
			minutes: Math.floor( ( timeDiff / 60 ) % 60 ),
			seconds: Math.floor( timeDiff % 60 )
				.toString()
				.padStart( 2, '0' ),
		} );
	}

	render() {
		const { receiptId, translate } = this.props;

		const title = translate( 'Checkout ‹ Plan Upgrade', {
			comment: '"Checkout" is the part of the site where a user is preparing to make a purchase.',
		} );

		return (
			<>
				<PageViewTracker
					path="/checkout/:site/offer-plan-upgrade/:upgrade_item/:receipt_id"
					title={ title }
					properties={ { upgrade_item: 'business' } }
				/>
				<DocumentHead title={ title } />
				<div className="business-plan-upgrade-upsell-new-design__container">
					<div className="business-plan-upgrade-upsell-new-design__header">
						{ receiptId ? this.header() : '' }
						<div className="business-plan-upgrade-upsell-new-design__header-title">
							{ this.title() }
						</div>
					</div>
					<div className="business-plan-upgrade-upsell-new-design__body">{ this.body() }</div>
					<div className="business-plan-upgrade-upsell-new-design__image-container">
						{ this.image() }
					</div>
					<div className="business-plan-upgrade-upsell-new-design__footer">{ this.footer() }</div>
				</div>
			</>
		);
	}

	header() {
		return null;
	}

	image() {
		return (
			<img
				className="business-plan-upgrade-upsell-new-design__image"
				src={ upsellImage }
				alt=""
				width="454"
			/>
		);
	}

	title() {
		const { translate } = this.props;
		return (
			<>
				<h2 className="business-plan-upgrade-upsell-new-design__title">
					{ translate( 'Upgrade your site to the most powerful plan ever' ) }
				</h2>
			</>
		);
	}

	body() {
		const { translate, hasSevenDayRefundPeriod } = this.props;

		const { hours, minutes, seconds } = {
			hours: this.state.hours,
			minutes: this.state.minutes,
			seconds: this.state.seconds,
		};

		return (
			<>
				<div className="business-plan-upgrade-upsell-new-design__column-pane">
					<p>
						<b>{ translate( 'Unlock the power of the Business Plan and gain access to:' ) }</b>
					</p>
					<ul className="business-plan-upgrade-upsell-new-design__checklist">
						<li className="business-plan-upgrade-upsell-new-design__checklist-item">
							<Gridicon
								icon="checkmark"
								className="business-plan-upgrade-upsell-new-design__checklist-item-icon"
							/>
							<span className="business-plan-upgrade-upsell-new-design__checklist-item-text">
								{ translate(
									'Using any WordPress plugins and extending the functionality of your website.'
								) }
							</span>
						</li>
						<li className="business-plan-upgrade-upsell-new-design__checklist-item">
							<Gridicon
								icon="checkmark"
								className="business-plan-upgrade-upsell-new-design__checklist-item-icon"
							/>
							<span className="business-plan-upgrade-upsell-new-design__checklist-item-text">
								{ translate( 'Uploading any WordPress themes purchased or downloaded elsewhere.' ) }
							</span>
						</li>
						<li className="business-plan-upgrade-upsell-new-design__checklist-item">
							<Gridicon
								icon="checkmark"
								className="business-plan-upgrade-upsell-new-design__checklist-item-icon"
							/>
							<span className="business-plan-upgrade-upsell-new-design__checklist-item-text">
								{ translate( 'Enjoying automated Jetpack backups & one-click website restores.' ) }
							</span>
						</li>
						<li className="business-plan-upgrade-upsell-new-design__checklist-item">
							<Gridicon
								icon="checkmark"
								className="business-plan-upgrade-upsell-new-design__checklist-item-icon"
							/>
							<span className="business-plan-upgrade-upsell-new-design__checklist-item-text">
								{ translate( 'Setting up SFTP and database credentials.' ) }
							</span>
						</li>
					</ul>
					<p>
						{ translate(
							'The great news is that you can upgrade today and try the Business Plan risk-free thanks to our {{b}}%(days)d-day money-back guarantee{{/b}}.',
							{
								components: {
									b: <b />,
								},
								args: {
									days: hasSevenDayRefundPeriod ? 7 : 14,
									comment: 'A number, e.g. 7-day money-back guarantee',
								},
							}
						) }
					</p>
					<p>
						{ hasSevenDayRefundPeriod
							? translate(
									"Upgrade now and we'll give you {{b}}%(discount)d%% off your first month{{/b}}.",
									{
										components: {
											b: <b />,
										},
										args: {
											discount: 15,
											comment: '%(discount)d is a percentage like 15%"',
										},
									}
							  )
							: translate(
									"Upgrade now and we'll give you {{b}}%(discount)d%% off your first year{{/b}}.",
									{
										components: {
											b: <b />,
										},
										args: {
											discount: 15,
											comment: '%(discount)d is a percentage like 15%"',
										},
									}
							  ) }
					</p>
					<div className="business-plan-upgrade-upsell-new-design__countdown-counter">
						<span>
							{ translate( 'Discount ends in %(hours)dh %(minutes)dm %(seconds)ss', {
								args: { hours, minutes, seconds },
								comment: 'The end string will look like "Discount ends in 6h 2m 20s"',
							} ) }
						</span>
					</div>
				</div>
			</>
		);
	}

	footer() {
		const { translate, handleClickAccept, handleClickDecline } = this.props;
		return (
			<footer>
				<Button
					primary
					className="business-plan-upgrade-upsell-new-design__accept-offer-button"
					onClick={ () => handleClickAccept( 'accept' ) }
				>
					{ translate( 'Upgrade Now' ) }
				</Button>
				<Button
					data-e2e-button="decline"
					className="business-plan-upgrade-upsell-new-design__decline-offer-button"
					onClick={ handleClickDecline }
				>
					{ translate( 'No Thanks' ) }
				</Button>
			</footer>
		);
	}
}
