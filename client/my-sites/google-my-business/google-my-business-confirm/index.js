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
import { recordTracksEvent } from 'state/analytics/actions';
import CompactCard from 'components/card/compact';
import HeaderCake from 'components/header-cake';
import Main from 'components/main';
import StepNavigation from '../step-navigation';

class GoogleMyBusinessConfirm extends Component {
	static propTypes = {
		recordTracksEvent: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	goBack = () => {
		page.back( `/google-my-business/${ this.props.siteId }` );
	};

	render() {
		const { translate, siteId } = this.props;
		const backHref = '/google-my-business/connections/' + siteId;
		const nextHref = '/google-my-business/verify/' + siteId;

		return (
			<Main className="google-my-business google-my-business-confirm" wideLayout>
				<HeaderCake isCompact={ false } alwaysShowActionText={ false } onClick={ this.goBack }>
					{ translate( 'Google My Business' ) }
				</HeaderCake>

				<CompactCard>
					<h2>{ translate( 'Verify your connection to this business' ) }</h2>
					<p>
						{ translate(
							"Let's confirm that you're authorized to manage " +
								"this business listing. Once verified, you'll be able to make " +
								'the most of your listing on Google.'
						) }
					</p>

					<ul className="google-my-business-confirm__list">
						<li>
							<Gridicon icon="checkmark-circle" size={ 18 } />
							{ translate( 'Get your business found on Google Search & Maps' ) }
						</li>
						<li>
							<Gridicon icon="checkmark-circle" size={ 18 } />
							{ translate( 'Respond to customer reviews' ) }
						</li>
						<li>
							<Gridicon icon="checkmark-circle" size={ 18 } />
							{ translate( 'Create promotional posts and upload photos' ) }
						</li>
						<li>
							<Gridicon icon="checkmark-circle" size={ 18 } />
							{ translate( 'Track business analytics' ) }
						</li>
					</ul>
				</CompactCard>

				<StepNavigation value={ 100 } total={ 100 } backHref={ backHref } nextHref={ nextHref } />
			</Main>
		);
	}
}

export default connect( undefined, { recordTracksEvent } )( localize( GoogleMyBusinessConfirm ) );
