import { useContext } from 'react';
import { TransactionStatusManager } from '../types';
import { TransactionStatusContext } from './transaction-status-context';

export function useTransactionStatus(): TransactionStatusManager {
	const transactionStatusManager = useContext( TransactionStatusContext );
	if ( ! transactionStatusManager ) {
		throw new Error( 'useTransactionStatus can only be called inside CheckoutProvider' );
	}
	return transactionStatusManager;
}
