/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import { render } from '../../../../test-utils';
import DetailsModalPHP from '../details-modal-php';
import type { PHPLog } from '@automattic/api-core';

const item: PHPLog = {
	id: 'log-1',
	timestamp: '2026-10-21T10:53:00Z',
	severity: 'Warning',
	message: 'PHP Warning: Constant DB_NAME already defined',
	kind: '',
	name: '',
	file: '/srv/htdocs/wp-config.php',
	line: 23,
};

describe( '<DetailsModalPHP>', () => {
	test( 'shows a dash for empty values', async () => {
		render( <DetailsModalPHP item={ item } gmtOffset={ 0 } /> );

		expect( await screen.findByText( '/srv/htdocs/wp-config.php' ) ).toBeVisible();
		expect( screen.getAllByText( '-' ) ).toHaveLength( 2 );
	} );
} );
