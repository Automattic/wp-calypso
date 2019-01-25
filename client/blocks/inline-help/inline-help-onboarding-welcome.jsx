/** @format */
/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import React from 'react';
import { connect } from 'react-redux';
import { translate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import Button from 'components/button';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';

export const InlineHelpOnboardingWelcome = ( { siteSlug, onClose } ) => {
	return (
		<div className="inline-help__onboarding-welcome">
			<img
				src="/calypso/images/signup/confetti.svg"
				aria-hidden="true"
				className="inline-help__confetti"
				alt=""
			/>
			<div className="inline-help__onboarding-welcome-content">
				<h2>{ translate( "You're off to a great start!" ) }</h2>
				<p>
					{ translate(
						"Let's get your site ready to launch by walking through a couple of short customization tasks."
					) }
				</p>
				<p className="inline-help__task-estimate">
					<Gridicon icon="time" size={ 18 } />
					{ translate( 'Estimated time:' ) }{' '}
					{ translate( '%d minute', '%d minutes', { count: 15, args: [ 15 ] } ) }
				</p>
			</div>
			<div className="inline-help__onboarding-buttons">
				<Button primary={ true } href={ `/checklist/${ siteSlug }` }>
					{ translate( 'Start customizing' ) }
				</Button>
				<Button onClick={ onClose }>{ translate( 'Not now' ) }</Button>
			</div>
		</div>
	);
};

export default connect( state => ( {
	siteSlug: getSiteSlug( state, getSelectedSiteId( state ) ),
} ) )( InlineHelpOnboardingWelcome );
