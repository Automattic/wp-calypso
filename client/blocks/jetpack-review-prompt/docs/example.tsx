/**
 * External dependencies
 */
import React, { FunctionComponent, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { Button, Card } from '@automattic/components';
import JetpackReviewPrompt from 'calypso/blocks/jetpack-review-prompt';
import SegmentedControl from 'calypso/components/segmented-control';
import CardHeading from 'calypso/components/card-heading';
import { getIsDismissed, getValidFromDate } from 'calypso/state/jetpack-review-prompt/selectors';
import { setValidFrom } from 'calypso/state/jetpack-review-prompt/actions';

const JetpackReviewPromptExample: FunctionComponent = () => {
	const dispatch = useDispatch();

	const [ type, setType ] = useState< 'scan' | 'restore' >( 'scan' );
	const [ align, setAlign ] = useState< 'center' | 'left' >( 'center' );

	const validFrom = useSelector( ( state ) => getValidFromDate( state, type ) );
	const isDimissed = useSelector( ( state ) => getIsDismissed( state, type ) );

	const handleMakeValid = () => dispatch( setValidFrom( type ) );

	return (
		<div>
			<JetpackReviewPrompt align={ align } type={ type } />
			{ null === validFrom && (
				<Card>
					<p>{ 'No `validFrom` Date Set' }</p>
					<Button
						disabled={ null !== validFrom && validFrom < Date.now() }
						onClick={ handleMakeValid }
						primary
					>
						{ 'Set `validFrom` to now' }
					</Button>
				</Card>
			) }
			<Card>
				<CardHeading>{ 'Type' }</CardHeading>
				<SegmentedControl primary>
					<SegmentedControl.Item selected={ 'scan' === type } onClick={ () => setType( 'scan' ) }>
						{ 'Scan Prompt' }
					</SegmentedControl.Item>
					<SegmentedControl.Item
						selected={ 'restore' === type }
						onClick={ () => setType( 'restore' ) }
					>
						{ 'Restore Prompt' }
					</SegmentedControl.Item>
				</SegmentedControl>
				<CardHeading>{ 'Align' }</CardHeading>
				<SegmentedControl primary>
					<SegmentedControl.Item
						selected={ 'center' === align }
						onClick={ () => setAlign( 'center' ) }
					>
						{ 'Center Align' }
					</SegmentedControl.Item>
					<SegmentedControl.Item selected={ 'left' === align } onClick={ () => setAlign( 'left' ) }>
						{ 'Left Align' }
					</SegmentedControl.Item>
				</SegmentedControl>
			</Card>
		</div>
	);
};

export default JetpackReviewPromptExample;
