/**
 * External dependencies
 */
import { random } from 'lodash';
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent, useState } from 'react';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { useInterval, EVERY_SECOND } from 'calypso/lib/interval';
import Gridicon from 'calypso/components/gridicon';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	formSubmissionError: Error | null;
	formSubmissionStatus: 'unsubmitted' | 'pending' | 'success' | 'failed';
	onFinishUp: () => void;
}

const Verification: FunctionComponent< Props > = ( { onFinishUp } ) => {
	const translate = useTranslate();

	const siteSlug = useSelector( getSelectedSiteSlug );

	const steps = [
		translate( 'Preflight check' ),
		translate( 'Login successful' ),
		translate( 'Locating WordPress installation' ),
		translate( 'File permission check complete' ),
		translate( 'Secure connection established' ),
	];

	const [ currentStep, setCurrentStep ] = useState( 0 );

	useInterval(
		() => {
			setCurrentStep( currentStep + 1 );
		},
		currentStep < steps.length ? random( EVERY_SECOND, EVERY_SECOND * 3 ) : null
	);

	return (
		<div>
			<div className="verification__title">
				<h3>
					{ translate( 'Establishing a connection to {{strong}}%(siteSlug)s{{/strong}}.', {
						args: {
							siteSlug,
						},
						components: {
							strong: <strong />,
						},
					} ) }
				</h3>
			</div>
			<ul className="verification__step-list">
				{ steps.map( ( step, index ) => {
					if ( index < currentStep ) {
						return (
							<li key={ index } className="verification__step-complete">
								<Gridicon icon="checkmark" />
								{ step }
							</li>
						);
					} else if ( index === currentStep ) {
						return (
							<li key={ index } className="verification__step-in-progress">
								<Gridicon icon="sync" />
								{ step }
							</li>
						);
					}
					return null;
				} ) }
			</ul>
			{ currentStep >= steps.length && (
				<div className="verification__buttons">
					<Button primary onClick={ onFinishUp }>
						{ translate( 'Finish up' ) }
					</Button>
				</div>
			) }
		</div>
	);
};

export default Verification;
