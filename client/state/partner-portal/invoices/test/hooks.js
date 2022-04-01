/**
 * @jest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react-hooks';
import nock from 'nock';
import { setLogger, QueryClient, QueryClientProvider } from 'react-query';
import useInvoiceQuery from 'calypso/state/partner-portal/invoices/hooks/use-invoices-query';

describe( 'useInvoicesQuery', () => {
	// @todo write tests
} );
