import { Button, useFormStatus, FormStatus } from '@automattic/composite-checkout';
import styled from '@emotion/styled';
import { useDispatch, useSelect, registerStore } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import debugFactory from 'debug';
import { Fragment, ReactNode } from 'react';
import { AnyAction } from 'redux';
import Field from '../field';
import { PaymentMethodLogos } from '../payment-method-logos';
import type {
	PaymentMethodStore,
	StoreSelectors,
	StoreSelectorsWithState,
	StoreActions,
	StoreState,
} from '../payment-method-store';
import type { RazorpayConfiguration } from '@automattic/calypso-razorpay';
import type { PaymentMethod, ProcessPayment } from '@automattic/composite-checkout';
import type { CartKey } from '@automattic/shopping-cart';

const debug = debugFactory( 'wpcom-checkout:razorpay-payment-method' );

type NounsInStore = 'customerPhone' | 'customerEmail';
type RazorpayStore = PaymentMethodStore< NounsInStore >;

const actions: StoreActions< NounsInStore > = {
	changeCustomerPhone( payload ) {
		return { type: 'CUSTOMER_PHONE_SET', payload };
	},
	changeCustomerEmail( payload ) {
		return { type: 'CUSTOMER_EMAIL_SET', payload };
	},
};

const selectors: StoreSelectorsWithState< NounsInStore > = {
	getCustomerPhone( state ) {
		return state.customerPhone;
	},
	getCustomerEmail( state ) {
		return state.customerEmail;
	},
};

export function createRazorpayPaymentMethodStore(): RazorpayStore {
	debug( 'creating a new p24 payment method store' );
	const store = registerStore( 'razorpay', {
		reducer(
			state: StoreState< NounsInStore > = {
				customerPhone: { value: '', isTouched: false },
				customerEmail: { value: '', isTouched: false },
			},
			action: AnyAction
		): StoreState< NounsInStore > {
			switch ( action.type ) {
				case 'CUSTOMER_PHONE_SET':
					return { ...state, customerPhone: { value: action.payload, isTouched: true } };
				case 'CUSTOMER_EMAIL_SET':
					return { ...state, customerEmail: { value: action.payload, isTouched: true } };
			}
			return state;
		},
		actions,
		selectors,
	} );

	return store;
}

function useCustomerData() {
	const { customerPhone, customerEmail } = useSelect( ( select ) => {
		const store = select( 'razorpay' ) as StoreSelectors< NounsInStore >;
		return {
			customerPhone: store.getCustomerPhone(),
			customerEmail: store.getCustomerEmail(),
		};
	}, [] );

	return {
		customerPhone,
		customerEmail,
	};
}

export function createRazorpayMethod( {
	razorpayConfiguration,
	cartKey,
	store,
	submitButtonContent,
}: {
	razorpayConfiguration: RazorpayConfiguration;
	cartKey: CartKey;
	store: RazorpayStore;
	submitButtonContent: ReactNode;
} ): PaymentMethod {
	return {
		id: 'razorpay',
		paymentProcessorId: 'razorpay',
		label: <RazorpayLabel />,
		submitButton: (
			<RazorpaySubmitButton
				razorpayConfiguration={ razorpayConfiguration }
				cartKey={ cartKey }
				store={ store }
				submitButtonContent={ submitButtonContent }
			/>
		),
		activeContent: <RazorpayFields />,
		inactiveContent: <RazorpaySummary />,
		getAriaLabel: ( __ ) => __( 'Razorpay' ),
	};
}

export function RazorpayLabel() {
	const { __ } = useI18n();

	return (
		<Fragment>
			<span>{ __( 'Razorpay' ) }</span>
			<PaymentMethodLogos className="razorpay__logo payment-logos">
				<RazorpayIcon />
			</PaymentMethodLogos>
		</Fragment>
	);
}

export function RazorpaySummary() {
	const { __ } = useI18n();
	return <Fragment>{ __( 'Razorpay' ) }</Fragment>;
}

const RazorpayFormWrapper = styled.div`
	padding: 16px;
	position: relative;

	::after {
		display: block;
		width: calc( 100% - 6px );
		height: 1px;
		content: '';
		background: ${ ( props ) => props.theme.colors.borderColorLight };
		position: absolute;
		top: 0;
		left: 3px;

		.rtl & {
			right: 3px;
			left: auto;
		}
	}
`;

const RazorpayField = styled( Field )`
	margin-top: 16px;

	:first-of-type {
		margin-top: 0;
	}
`;

function RazorpayFields() {
	const { __ } = useI18n();

	const { customerPhone, customerEmail } = useCustomerData();
	const { changeCustomerPhone, changeCustomerEmail } = useDispatch( 'razorpay' );
	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== FormStatus.READY;

	return (
		<RazorpayFormWrapper>
			<RazorpayField
				id="razorpay-customer-phone"
				type="Text"
				autoComplete="tel"
				label={ __( 'Phone number' ) }
				value={ customerPhone.value }
				onChange={ changeCustomerPhone }
				isError={ customerPhone.isTouched && customerPhone.value.length === 0 }
				errorMessage={ __( 'This field is required' ) }
				disabled={ isDisabled }
			/>
			<RazorpayField
				id="razorpay-customer-email"
				type="Text"
				autoComplete="cc-email"
				label={ __( 'Email address' ) }
				value={ customerEmail.value ?? '' }
				onChange={ changeCustomerEmail }
				isError={ customerEmail.isTouched && customerEmail.value.length === 0 }
				errorMessage={ __( 'This field is required' ) }
				disabled={ isDisabled }
			/>
		</RazorpayFormWrapper>
	);
}

function isFormValid( store: RazorpayStore ): boolean {
	const customerPhone = selectors.getCustomerPhone( store.getState() );
	const customerEmail = selectors.getCustomerEmail( store.getState() );

	if ( ! customerPhone.value.length ) {
		// Touch the field so it displays a validation error
		store.dispatch( actions.changeCustomerPhone( '' ) );
	}
	if ( ! customerEmail.value.length ) {
		store.dispatch( actions.changeCustomerEmail( '' ) );
	}
	if ( ! customerPhone.value.length || ! customerEmail.value.length ) {
		return false;
	}
	return true;
}

export function RazorpaySubmitButton( {
	disabled,
	onClick,
	store,
	razorpayConfiguration,
	cartKey,
	submitButtonContent,
}: {
	disabled?: boolean;
	onClick?: ProcessPayment;
	store: RazorpayStore;
	razorpayConfiguration: RazorpayConfiguration;
	cartKey: CartKey;
	submitButtonContent: ReactNode;
} ) {
	const { formStatus } = useFormStatus();
	const { customerPhone, customerEmail } = useCustomerData();

	// This must be typed as optional because it's injected by cloning the
	// element in CheckoutSubmitButton, but the uncloned element does not have
	// this prop yet.
	if ( ! onClick ) {
		throw new Error(
			'Missing onClick prop; RazorpayButton must be used as a payment button in CheckoutSubmitButton'
		);
	}

	return (
		<Button
			disabled={ disabled }
			onClick={ ( ev ) => {
				if ( isFormValid( store ) ) {
					ev.preventDefault();
					debug( 'Initiate razorpay payment' );
					onClick( {
						razorpayConfiguration,
						cartKey,
						phoneNumber: customerPhone.value,
						email: customerEmail.value,
					} );
				}
			} }
			buttonType="primary"
			isBusy={ FormStatus.SUBMITTING === formStatus }
			fullWidth
		>
			{ submitButtonContent }
		</Button>
	);
}

// Adapted from https://en.wikipedia.org/wiki/File:Razorpay_logo.svg
// Original file is public domain
export function RazorpayIcon() {
	return (
		<svg
			width="90px"
			height="18px"
			viewBox="0 0 1896 401"
			version="1.1"
			xmlns="http://www.w3.org/2000/svg"
			xmlnsXlink="http://www.w3.org/1999/xlink"
		>
			<g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
				<path
					fill="#072654"
					d="M451.9209,151.4937 C448.9309,162.6497 443.1359,170.8377 434.5349,176.0657 C425.9239,181.2927 413.8469,183.9117 398.2689,183.9117 L348.7769,183.9117 L366.1509,119.0807 L415.6429,119.0807 C431.2089,119.0807 441.8959,121.6947 447.7019,126.9217 C453.4969,132.1547 454.9109,140.3437 451.9209,151.4937 M503.1739,150.0967 C509.4679,126.6377 506.8589,108.6267 495.3509,96.0797 C483.8409,83.5327 463.6739,77.2627 434.8709,77.2627 L324.3909,77.2627 L257.8969,325.4027 L311.5719,325.4027 L338.3809,225.3777 L373.5809,225.3777 C381.4739,225.3777 387.6869,226.6577 392.2309,229.2137 C396.7849,231.7747 399.4509,236.3067 400.2739,242.8037 L409.8479,325.4027 L467.3589,325.4027 L458.0289,248.3847 C456.1279,231.1897 448.2589,221.0827 434.4309,218.0637 C452.0599,212.9577 466.8259,204.4677 478.7179,192.6167 C490.5989,180.7717 498.7579,166.6017 503.1739,150.0967"
				/>
				<path
					fill="#072654"
					d="M633.625,236.533 C629.14,253.258 622.231,266.042 612.901,274.868 C603.56,283.7 592.386,288.111 579.382,288.111 C566.122,288.111 557.128,283.758 552.387,275.042 C547.623,266.332 547.461,253.733 551.889,237.228 C556.305,220.735 563.352,207.841 573.053,198.539 C582.742,189.255 594.09,184.602 607.105,184.602 C620.11,184.602 628.919,189.082 633.485,198.024 C638.053,206.966 638.11,219.802 633.625,236.533 L633.625,236.533 Z M657.153,148.706 L650.431,173.8 C647.521,164.736 641.9,157.538 633.578,152.195 C625.245,146.852 614.918,144.174 602.608,144.174 C587.506,144.174 572.983,148.069 559.052,155.852 C545.12,163.64 532.938,174.617 522.519,188.786 C512.099,202.961 504.461,219.107 499.604,237.228 C494.748,255.356 493.774,271.328 496.695,285.149 C499.616,298.977 505.944,309.605 515.691,317.04 C525.428,324.481 537.969,328.19 553.303,328.19 C565.612,328.19 577.342,325.635 588.469,320.523 C599.595,315.418 609.041,308.325 616.818,299.266 L609.807,325.403 L661.731,325.403 L709.079,148.706 L657.153,148.706 Z"
				/>
				<polygon
					fill="#072654"
					points="895.79 148.7061 744.882 148.7061 734.334 188.0911 822.155 188.0911 706.042 288.4581 696.132 325.4031 851.92 325.4031 862.478 286.0241 768.388 286.0241 886.263 184.2541"
				/>
				<path
					fill="#072654"
					d="M1028.6514,236.1853 C1023.9804,253.6053 1017.0604,266.6273 1007.9044,275.2223 C998.7484,283.8163 987.6674,288.1103 974.6634,288.1103 C947.4714,288.1103 938.5234,270.8113 947.7964,236.1853 C952.4094,218.9903 959.3634,206.0383 968.6594,197.3283 C977.9654,188.6123 989.2324,184.2543 1002.4804,184.2543 C1015.4844,184.2543 1024.2584,188.6123 1028.7794,197.3283 C1033.2984,206.0383 1033.2644,218.9903 1028.6514,236.1853 M1059.0304,155.3243 C1047.0804,147.8943 1031.8154,144.1743 1013.2244,144.1743 C994.4014,144.1743 976.9694,147.8943 960.9174,155.3243 C944.8644,162.7653 931.1984,173.4523 919.9214,187.3893 C908.6314,201.3323 900.4954,217.5943 895.5114,236.1853 C890.5274,254.7763 889.9484,271.0323 893.7734,284.9753 C897.5864,298.9183 905.5144,309.6053 917.5914,317.0403 C929.6574,324.4813 945.0954,328.1903 963.9194,328.1903 C982.5094,328.1903 999.7674,324.4813 1015.7054,317.0403 C1031.6184,309.6053 1045.2374,298.9183 1056.5264,284.9753 C1067.8034,271.0323 1075.9404,254.7763 1080.9244,236.1853 C1085.9084,217.5943 1086.4884,201.3323 1082.6744,187.3893 C1078.8494,173.4523 1070.9674,162.7653 1059.0304,155.3243"
				/>
				<path
					fill="#072654"
					d="M1602.1367,236.533 C1597.6517,253.258 1590.7427,266.042 1581.4127,274.868 C1572.0817,283.7 1560.8857,288.111 1547.8817,288.111 C1534.6457,288.111 1525.6397,283.758 1520.8987,275.042 C1516.1347,266.332 1515.9727,253.733 1520.4007,237.228 C1524.8167,220.735 1531.8637,207.841 1541.5647,198.539 C1551.2537,189.255 1562.6017,184.602 1575.6167,184.602 C1588.6217,184.602 1597.4307,189.082 1601.9967,198.024 C1606.5647,206.966 1606.6217,219.802 1602.1367,236.533 L1602.1367,236.533 Z M1625.6647,148.706 L1618.9427,173.8 C1616.0327,164.736 1610.4117,157.538 1602.0897,152.195 C1593.7567,146.852 1583.4297,144.174 1571.1197,144.174 C1556.0177,144.174 1541.4947,148.069 1527.5637,155.852 C1513.6317,163.64 1501.4497,174.617 1491.0307,188.786 C1480.6107,202.961 1472.9717,219.107 1468.1157,237.228 C1463.2597,255.356 1462.2967,271.328 1465.2067,285.149 C1468.1267,298.977 1474.4447,309.605 1484.2027,317.04 C1493.9397,324.481 1506.4807,328.19 1521.8147,328.19 C1534.1227,328.19 1545.8537,325.635 1556.9797,320.523 C1568.1067,315.418 1577.5527,308.325 1585.3297,299.266 L1578.3187,325.403 L1630.2427,325.403 L1677.5907,148.706 L1625.6647,148.706 Z"
				/>
				<path
					fill="#072654"
					d="M1244.165,196.1055 L1257.401,148.0105 C1252.904,145.6865 1246.946,144.5225 1239.517,144.5225 C1227.66,144.5225 1216.243,147.4835 1205.244,153.4115 C1195.798,158.4975 1187.754,165.6365 1180.962,174.5815 L1187.847,148.6815 L1172.813,148.7065 L1135.938,148.7065 L1088.227,325.4025 L1140.87,325.4025 L1165.616,233.0505 C1169.221,219.5765 1175.688,209.0635 1185.042,201.5125 C1194.372,193.9615 1206.02,190.1825 1219.964,190.1825 C1228.563,190.1825 1236.619,192.1585 1244.165,196.1055"
				/>
				<path
					fill="#072654"
					d="M1390.6973,237.2256 C1386.2693,253.7306 1379.4083,266.3296 1370.1123,275.0396 C1360.7943,283.7556 1349.6433,288.1076 1336.6393,288.1076 C1323.6233,288.1076 1314.7573,283.6976 1310.0393,274.8656 C1305.3103,266.0396 1305.1943,253.2606 1309.6793,236.5296 C1314.1653,219.7996 1321.1423,206.9626 1330.6243,198.0206 C1340.1043,189.0786 1351.3593,184.5986 1364.3753,184.5986 C1377.1473,184.5986 1385.8293,189.2526 1390.4303,198.5426 C1395.0203,207.8376 1395.1133,220.7376 1390.6973,237.2256 M1427.4853,155.8486 C1417.7153,148.0656 1405.2783,144.1776 1390.1873,144.1776 C1376.9393,144.1776 1364.3293,147.1966 1352.3903,153.2356 C1340.4183,159.2856 1330.7173,167.5206 1323.2753,177.9806 L1323.4433,176.8216 L1332.2873,148.6786 L1322.1103,148.6786 L1322.1103,148.7036 L1280.9003,148.7036 L1267.8153,197.5656 C1267.6643,198.1336 1267.5373,198.6636 1267.3853,199.2376 L1213.4093,400.6806 L1266.0423,400.6806 L1293.2213,299.2696 C1295.8863,308.3216 1301.4273,315.4146 1309.8193,320.5206 C1318.2103,325.6316 1328.5603,328.1876 1340.8813,328.1876 C1356.2163,328.1876 1370.7963,324.4786 1384.6463,317.0376 C1398.4863,309.6076 1410.5163,298.9736 1420.7173,285.1466 C1430.9273,271.3306 1438.4623,255.3526 1443.3183,237.2256 C1448.1753,219.1036 1449.1823,202.9586 1446.3663,188.7836 C1443.5503,174.6136 1437.2443,163.6376 1427.4853,155.8486"
				/>
				<path
					fill="#072654"
					d="M1895.5381,148.7554 L1895.5721,148.7064 L1863.6921,148.7064 C1862.6731,148.7064 1861.7741,148.7354 1860.8421,148.7554 L1844.2961,148.7554 L1835.8351,160.5434 C1835.1571,161.4314 1834.4791,162.3254 1833.7491,163.3624 L1832.8271,164.7274 L1765.5851,258.3754 L1751.6421,148.7064 L1696.5641,148.7064 L1724.4561,315.3544 L1662.8591,400.6834 L1664.6151,400.6834 L1696.0651,400.6834 L1717.7341,400.6834 L1732.6621,379.5374 C1733.1021,378.9074 1733.4791,378.3914 1733.9491,377.7254 L1751.3691,353.0284 L1751.8681,352.3214 L1829.8131,241.8274 L1895.4851,148.8284 L1895.5721,148.7554 L1895.5381,148.7554 Z"
				/>
				<polygon
					fill="#3395FF"
					points="122.6338 105.6902 106.8778 163.6732 197.0338 105.3642 138.0748 325.3482 197.9478 325.4032 285.0458 0.4822"
				/>
				<path
					fill="#072654"
					d="M25.5947,232.9246 L0.8077,325.4026 L123.5337,325.4026 C123.5337,325.4026 173.7317,137.3196 173.7457,137.2656 C173.6987,137.2956 25.5947,232.9246 25.5947,232.9246"
				/>
			</g>
		</svg>
	);
}
