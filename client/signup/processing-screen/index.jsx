/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { find, isEmpty } from 'lodash';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import { showOAuth2Layout } from 'state/ui/oauth2-clients/selectors';
import config from 'config';
import { getCurrentUser } from 'state/current-user/selectors';

/**
 * Style dependencies
 */
import './style.scss';

export class SignupProcessingScreen extends Component {
	static propTypes = {
		hasCartItems: PropTypes.bool.isRequired,
		loginHandler: PropTypes.func,
		steps: PropTypes.array.isRequired,
		user: PropTypes.object,
		signupProgress: PropTypes.array,
		flowSteps: PropTypes.array,
		useOAuth2Layout: PropTypes.bool.isRequired,
	};

	state = {
		siteSlug: '',
		hasPaidSubscription: false,
	};

	UNSAFE_componentWillReceiveProps( nextProps ) {
		const dependencies = nextProps.signupDependencies;

		if ( isEmpty( dependencies ) ) {
			return;
		}

		const siteSlug = dependencies.siteSlug;
		if ( siteSlug ) {
			this.setState( { siteSlug } );
		}

		const hasPaidSubscription = !! ( dependencies.cartItem || dependencies.domainItem );
		this.setState( { hasPaidSubscription } );
	}

	renderFloaties() {
		// Non standard gridicon sizes are used here because we display giant, floating icons on the page with an animation
		/* eslint-disable wpcalypso/jsx-gridicon-size, wpcalypso/jsx-classname-namespace */
		return (
			<div className="signup-processing-screen__floaties">
				<Gridicon icon="add" size={ 64 } />
				<Gridicon icon="aside" size={ 64 } />
				<Gridicon icon="attachment" size={ 64 } />
				<Gridicon icon="audio" size={ 64 } />
				<Gridicon icon="bell" size={ 64 } />
				<Gridicon icon="book" size={ 64 } />
				<Gridicon icon="camera" size={ 64 } />
				<Gridicon icon="comment" size={ 64 } />
				<Gridicon icon="globe" size={ 64 } />
				<Gridicon icon="pencil" size={ 64 } />
				<Gridicon icon="phone" size={ 64 } />
				<Gridicon icon="reader" size={ 64 } />
				<Gridicon icon="star" size={ 64 } />
				<Gridicon icon="video" size={ 64 } />
				<Gridicon icon="align-image-right" size={ 64 } />
				<Gridicon icon="bookmark" size={ 64 } />
				<Gridicon icon="briefcase" size={ 64 } />
				<Gridicon icon="calendar" size={ 64 } />
				<Gridicon icon="clipboard" size={ 64 } />
				<Gridicon icon="cloud-upload" size={ 64 } />
				<Gridicon icon="cog" size={ 64 } />
				<Gridicon icon="customize" size={ 64 } />
				<Gridicon icon="help" size={ 64 } />
				<Gridicon icon="link" size={ 64 } />
				<Gridicon icon="lock" size={ 64 } />
				<Gridicon icon="pages" size={ 64 } />
				<Gridicon icon="share" size={ 64 } />
				<Gridicon icon="stats" size={ 64 } />
			</div>
		);
		/* eslint-enable wpcalypso/jsx-gridicon-size, wpcalypso/jsx-classname-namespace */
	}

	getTitle() {
		const { loginHandler } = this.props;

		const stepWithDomainItem = find( this.props.steps, step => step.domainItem );

		if ( stepWithDomainItem ) {
			const domain = stepWithDomainItem.domainItem.meta;

			return loginHandler
				? this.props.translate(
						"{{strong}}Done!{{/strong}} Thanks for waiting, %(domain)s is all set up and we're ready " +
							'for you to get started.',
						{
							components: { strong: <strong /> },
							args: { domain },
						}
				  )
				: this.props.translate(
						'{{strong}}Awesome!{{/strong}} Give us one minute and we’ll move right along.',
						{
							components: { strong: <strong /> },
							args: { domain },
						}
				  );
		}

		return loginHandler
			? this.props.translate(
					'{{strong}}Done!{{/strong}} Thanks for waiting, we’re ready for you to get started.',
					{
						components: { strong: <strong /> },
					}
			  )
			: this.props.translate(
					'{{strong}}Awesome!{{/strong}} Give us one minute and we’ll move right along.',
					{
						components: { strong: <strong /> },
					}
			  );
	}

	showChecklistAfterLogin = () => {
		analytics.tracks.recordEvent( 'calypso_checklist_assign', {
			site: this.state.siteSlug,
			plan: 'free',
		} );
		this.props.loginHandler( { redirectTo: `/checklist/${ this.state.siteSlug }` } );
	};

	shouldShowChecklist() {
		const designType = ( this.props.steps || [] ).reduce( function( accumulator, step ) {
			return accumulator || ( step.providedDependencies && step.providedDependencies.designType );
		}, null );

		return (
			config.isEnabled( 'onboarding-checklist' ) &&
			'store' !== designType &&
			[ 'main', 'onboarding', 'desktop', 'subdomain' ].includes( this.props.flowName )
		);
	}

	render() {
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		const { loginHandler } = this.props;

		if ( !! loginHandler ) {
			this.shouldShowChecklist() ? this.showChecklistAfterLogin() : loginHandler();
			return null;
		}

		return (
			<div>
				{ this.renderFloaties() }

				<div className="signup-processing__content">
					<p className="signup-process-screen__title">{ this.getTitle() }</p>
				</div>
				<div className="signup-processing-screen__loader">
					{ this.props.translate( 'Loading…' ) }
				</div>
			</div>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
}

export default connect( state => ( {
	useOAuth2Layout: showOAuth2Layout( state ),
	user: getCurrentUser( state ),
} ) )( localize( SignupProcessingScreen ) );
