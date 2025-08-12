import { createContext } from 'react';
import { CheckoutContextInterface } from '../types';

const defaultCheckoutContext: CheckoutContextInterface = {};

const CheckoutContext = createContext( defaultCheckoutContext );

export default CheckoutContext;
