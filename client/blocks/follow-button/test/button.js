/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import FollowButton from '../button';

describe( 'FollowButton', () => {
	test( 'should apply a custom follow label', () => {
		render( <FollowButton followLabel="Follow Tag" /> );
		expect( screen.getByText( 'Follow Tag' ) ).toBeVisible();
	} );
} );
