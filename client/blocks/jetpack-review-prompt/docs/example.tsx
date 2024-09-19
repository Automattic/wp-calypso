import { Button, Card, SegmentedControl } from '@automattic/components';
import { FunctionComponent, useState } from 'react';
import JetpackReviewPrompt from 'calypso/blocks/jetpack-review-prompt';
import CardHeading from 'calypso/components/card-heading';
import { useSelector, useDispatch } from 'calypso/state';
import { setValidFrom } from 'calypso/state/jetpack-review-prompt/actions';
import { PREFERENCE_NAME } from 'calypso/state/jetpack-review-prompt/constants';
import { getIsDismissed, getValidFromDate } from 'calypso/state/jetpack-review-prompt/selectors';
import { savePreference } from 'calypso/state/preferences/actions';

const JetpackReviewPromptExample: FunctionComponent = () => {
	const dispatch = useDispatch();

	const [ type, setType ] = useState< 'scan' | 'restore' >( 'scan' );
	const [ align, setAlign ] = useState< 'center' | 'left' >( 'center' );

	const validFrom = useSelector( ( state ) => getValidFromDate( state, type ) );
	const isDismissed = useSelector( ( state ) => getIsDismissed( state, type ) );

	const handleMakeValid = () => dispatch( setValidFrom( type ) );
	const handleClearDismiss = () => dispatch( savePreference( PREFERENCE_NAME, null ) );

	return (
		<div>
			<JetpackReviewPrompt align={ align } type={ type } />
			{ null === validFrom && (
				<Card>
					<p>No `validFrom` Date Set</p>
					<Button onClick={ handleMakeValid } primary>
						Set `validFrom` to now
					</Button>
				</Card>
			) }
			{ isDismissed && (
				<Card>
					<p>Review Prompt is dismissed</p>
					<Button onClick={ handleClearDismiss } primary>
						Clear Dismissal
					</Button>
				</Card>
			) }
			<Card>
				<CardHeading>Type</CardHeading>
				<SegmentedControl primary>
					<SegmentedControl.Item selected={ 'scan' === type } onClick={ () => setType( 'scan' ) }>
						Scan Prompt
					</SegmentedControl.Item>
					<SegmentedControl.Item
						selected={ 'restore' === type }
						onClick={ () => setType( 'restore' ) }
					>
						Restore Prompt
					</SegmentedControl.Item>
				</SegmentedControl>
				<CardHeading>Align</CardHeading>
				<SegmentedControl primary>
					<SegmentedControl.Item
						selected={ 'center' === align }
						onClick={ () => setAlign( 'center' ) }
					>
						Center Align
					</SegmentedControl.Item>
					<SegmentedControl.Item selected={ 'left' === align } onClick={ () => setAlign( 'left' ) }>
						Left Align
					</SegmentedControl.Item>
				</SegmentedControl>
			</Card>
		</div>
	);
};

export default JetpackReviewPromptExample;
