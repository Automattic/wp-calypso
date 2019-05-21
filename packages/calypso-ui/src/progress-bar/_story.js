/**
 * External dependencies
 */
import React from 'react';
import { storiesOf } from '@storybook/react';

/**
 * Internal dependencies
 */
import ProgressBar from './';

storiesOf( 'ProgressBar', module )
	.add( '0% percent', () => <ProgressBar value={ 0 } title="0% complete" /> )
	.add( '50% done', () => <ProgressBar value={ 50 } total={ 100 } /> )
	.add( 'custom color', () => <ProgressBar value={ 100 } color="#1BABDA" /> )
	.add( 'pulsing', () => <ProgressBar value={ 100 } isPulsing /> );

