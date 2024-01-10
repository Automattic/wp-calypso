import { Spinner } from '@automattic/components';
import classNames from 'classnames';
import { translate } from 'i18n-calypso';
import { useEffect, useState } from 'react';

import './style.scss';

export type ThankYouProductProps = {
	name: string;
	details?: string;
	icon?: string;
	actions?: React.ReactNode;
	preview?: React.ReactNode;
	isFree?: boolean;
	isLoading?: boolean;
};

const ThankYouProduct = ( {
	name,
	details,
	icon,
	actions,
	preview,
	isFree = false,
	isLoading = false,
}: ThankYouProductProps ) => {
	const [ shouldShowLoader, setShouldShowLoader ] = useState( isLoading );

	useEffect( () => {
		setShouldShowLoader( isLoading );
	}, [ isLoading ] );

	return (
		<li className={ classNames( 'thank-you__product', { 'is-free': isFree } ) }>
			{ icon && (
				<img
					className="thank-you__product-icon"
					src={ icon }
					width={ 50 }
					height={ 50 }
					alt={ translate( "%(name)s's icon", { args: { name } } ) as string }
				/>
			) }

			<div className="thank-you__product-info">
				{ shouldShowLoader ? (
					<Spinner />
				) : (
					<>
						<div className="thank-you__product-name">{ name }</div>
						<div className="thank-you__product-details">{ details }</div>
					</>
				) }
			</div>

			{ actions && <div className="thank-you__product-actions">{ actions }</div> }

			{ preview && <div className="thank-you__product-preview">{ preview }</div> }
		</li>
	);
};

export default ThankYouProduct;
