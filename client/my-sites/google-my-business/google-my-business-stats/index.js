/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import page from 'page';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import SectionHeader from 'components/section-header';
import Button from 'components/button';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import Main from 'components/main';
import Card from 'components/card';
import StatsNavigation from 'blocks/stats-navigation';
import { recordTracksEvent } from 'state/analytics/actions';
import FormFieldset from 'components/forms/form-fieldset';
import FormSelect from 'components/forms/form-select';

class Stats extends Component {
	static propTypes = {
		recordTracksEvent: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	goBack = () => {
		page.back( `/google-my-business/${ this.props.siteId }` );
	};

	render() {
		const { translate, siteId } = this.props;
		return (
			<Main>
				<SidebarNavigation title="Stats" />
				<div className="google-my-business-stats">
					<StatsNavigation selectedItem={ 'google-my-business' } />

					<Card>
						<div className="google-my-business-stats__container">
							<img
								src="https://lh5.googleusercontent.com/p/AF1QipPBVVXFSwBfsObM5TbyoLSGySD_CJAXiztaxf0a=w408-h544-k-no"
								className="google-my-business-stats__image"
							/>

							<div className="google-my-business-stats__text">
								<div className="google-my-business-stats__header">Cate's Cookies</div>
								<div className="google-my-business-stats__verified">
									<Gridicon icon="checkmark-circle" size={ 18 } /> Verified
								</div>
							</div>
						</div>

						<div className="google-my-business-stats__listing-detail">
							<Gridicon icon="phone" size={ 18 } /> (865) 367-2746
						</div>
						<div className="google-my-business-stats__listing-detail">
							<Gridicon icon="time" size={ 18 } /> 9:00 AM - 6:00 PM
						</div>
						<div className="google-my-business-stats__listing-detail">
							<Gridicon icon="globe" size={ 18 } /> www.catescookies.com
						</div>
						<div className="google-my-business-stats__address">
							<Gridicon icon="location" size={ 18 } />
							<div className="google-my-business-stats__listing-detail">
								345 North Avenue<br />Talihassee, FL 34342<br />USA
							</div>
						</div>
						<div className="google-my-business-stats__listing-detail">
							<Gridicon icon="tag" size={ 18 } /> Bakery
						</div>
						<Button
							className="google-my-business-stats__listing-button"
							href="https://business.google.com"
							target="_blank"
						>
							Update Listing
							<Gridicon icon="external" />
						</Button>
					</Card>

					<SectionHeader label={ translate( 'How customers search for your business' ) } />
					<Card>
						<img src="/calypso/images/google-my-business/pie-chart.svg" />
						<p>451 Total searches</p>
						<p>
							Direct<br />
							362 (60%)<br />
							Customers who find your listing searching for your business name or address
						</p>

						<p>
							Discovery<br />
							89 (40%)<br />
							Customers who find your listing searching for a category, product, or service
						</p>
					</Card>

					<Card>
						<p>
							Businesses with recent photos typically receive more clicks to their business
							websites.
						</p>
						<img src="/calypso/images/google-my-business/reviews.svg" />
						<Button primary>
							Post Photos
							<Gridicon icon="external" />
						</Button>
					</Card>

					<SectionHeader
						label={ translate( 'Where your customers view your business on Google' ) }
					/>
					<Card>
						<p>The Google services that customers use to find your business</p>
						<FormFieldset>
							<FormSelect>
								<option>{ translate( '1 week' ) }</option>
								<option>{ translate( '1 month' ) }</option>
								<option>{ translate( '1 quarter' ) }</option>
							</FormSelect>
						</FormFieldset>
						<p>451 total views</p>
					</Card>

					<SectionHeader label={ translate( 'Customer actions' ) } />
					<Card>
						<p>The most common actions that customers take on your listing</p>
						<FormFieldset>
							<FormSelect>
								<option>{ translate( '1 week' ) }</option>
								<option>{ translate( '1 month' ) }</option>
								<option>{ translate( '1 quarter' ) }</option>
							</FormSelect>
						</FormFieldset>
						<p>156 total actions</p>
					</Card>

					<Card>
						<p>Complete business listings get on average 7x more clicks than empty listings.</p>
						<img src="/calypso/images/google-my-business/complete-listing.svg" />
						<Button primary>
							Complete your listing
							<Gridicon icon="external" />
						</Button>
					</Card>

					<SectionHeader label={ translate( 'Driving direction results' ) } />
					<Card>
						<p>The places where customers request driving directions to your business.</p>
						<FormFieldset>
							<FormSelect>
								<option>{ translate( '1 week' ) }</option>
								<option>{ translate( '1 month' ) }</option>
								<option>{ translate( '1 quarter' ) }</option>
							</FormSelect>
						</FormFieldset>
						<img src="/calypso/images/google-my-business/not-enough-data.svg" />
						<p>{ translate( "We don't have enough data" ) }</p>
					</Card>

					<SectionHeader label={ translate( 'Phone Calls' ) } />
					<Card>
						<p>When and how many times customers call your business</p>
						<FormFieldset>
							<FormSelect>
								<option>{ translate( 'Time of day' ) }</option>
							</FormSelect>
							<FormSelect>
								<option>{ translate( '1 week' ) }</option>
								<option>{ translate( '1 month' ) }</option>
								<option>{ translate( '1 quarter' ) }</option>
							</FormSelect>
						</FormFieldset>
						<img src="/calypso/images/google-my-business/not-enough-data.svg" />
						<p>{ translate( "We don't have enough data" ) }</p>
					</Card>

					<SectionHeader label={ translate( 'Return customers' ) } />
					<Card>
						<p>How many customers return to your website?</p>
						<FormFieldset>
							<FormSelect>
								<option>{ translate( '1 week' ) }</option>
								<option>{ translate( '1 month' ) }</option>
								<option>{ translate( '1 quarter' ) }</option>
							</FormSelect>
						</FormFieldset>
						<img src="/calypso/images/google-my-business/not-enough-data.svg" />
						<p>{ translate( "We don't have enough data" ) }</p>
					</Card>

					<SectionHeader label={ translate( 'Popular times' ) } />
					<Card>
						<p>The most popular times for your customers to visit your website.</p>
						<img src="/calypso/images/google-my-business/not-enough-data.svg" />
						<p>{ translate( "We don't have enough data" ) }</p>
					</Card>

					<SectionHeader label={ translate( 'Photo views' ) } />
					<Card>
						<p>
							The number of times your business photos have been viewed, compared to photos from
							other businesses.
						</p>
						<FormFieldset>
							<FormSelect>
								<option>{ translate( '1 week' ) }</option>
								<option>{ translate( '1 month' ) }</option>
								<option>{ translate( '1 quarter' ) }</option>
							</FormSelect>
						</FormFieldset>
					</Card>

					<SectionHeader label={ translate( 'Photo quantity' ) } />
					<Card>
						<p>
							The number of photos that appear on your business, compared to photos from other
							businesses.
						</p>
						<FormFieldset>
							<FormSelect>
								<option>{ translate( '1 week' ) }</option>
								<option>{ translate( '1 month' ) }</option>
								<option>{ translate( '1 quarter' ) }</option>
							</FormSelect>
						</FormFieldset>
					</Card>

					<Card>
						<p>
							{ translate(
								'The information you see here may only be accessed for use by this organization. You agree to not attempt to use Insights to track or collect personally identifiable information of any users. Values are approximate and only significant values may be shown. Learn More'
							) }
						</p>
					</Card>
				</div>
			</Main>
		);
	}
}

export default connect( undefined, { recordTracksEvent } )( localize( Stats ) );
