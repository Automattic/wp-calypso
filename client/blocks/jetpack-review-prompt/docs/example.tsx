/**
 * External dependencies
 */
import React, { FunctionComponent, useState } from 'react';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import JetpackReviewPrompt from 'calypso/blocks/jetpack-review-prompt';
import SegmentedControl from 'calypso/components/segmented-control';
import CardHeading from 'calypso/components/card-heading';

const JetpackReviewPromptExample: FunctionComponent = () => {
	const [ type, setType ] = useState< 'scan' | 'restore' >( 'scan' );
	const [ align, setAlign ] = useState< 'center' | 'left' >( 'center' );

	return (
		<div>
			<JetpackReviewPrompt align={ align } type={ type } />
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
