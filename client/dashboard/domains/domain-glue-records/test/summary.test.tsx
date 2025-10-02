/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import DomainGlueRecordsSettingsSummary from '../summary';

const domainName = 'example.com';

function renderSummary() {
	return render( <DomainGlueRecordsSettingsSummary domainName={ domainName } /> );
}

afterEach( () => nock.cleanAll() );

test( 'renders domain glue records summary with correct title and link', async () => {
	renderSummary();

	expect( screen.getByRole( 'link', { name: 'Glue records' } ) ).toHaveAttribute(
		'href',
		`/domains/${ domainName }/glue-records`
	);
} );
