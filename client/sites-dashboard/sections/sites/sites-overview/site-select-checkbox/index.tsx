import { Tooltip } from '@automattic/components';
import { ReactNode, useRef, useState } from 'react';
import FormInputCheckbox from 'calypso/components/forms/form-checkbox';
import type { SiteData } from '../types';

import './style.scss';

interface Props {
	item: SiteData;
	siteError: boolean;
	isLargeScreen?: boolean;
	disabled?: boolean;
	tooltip?: ReactNode;
}

export default function SiteSelectCheckbox( {
	item,
	siteError,
	isLargeScreen,
	disabled,
	tooltip,
}: Props ) {
	const [ showTooltip, setShowTooltip ] = useState( false );
	const checkboxRef = useRef< HTMLSpanElement | null >( null );

	const handleShowTooltip = () => {
		setShowTooltip( true );
	};

	const handleHideTooltip = () => {
		setShowTooltip( false );
	};

	return (
		<span
			className="site-select-checkbox"
			ref={ checkboxRef }
			role="button"
			tabIndex={ 0 }
			onMouseEnter={ handleShowTooltip }
			onMouseLeave={ handleHideTooltip }
			onMouseDown={ handleHideTooltip }
		>
			<FormInputCheckbox
				className="disable-card-expand"
				id={ `${ item.site.value.ID }` }
				onClick={ () => {} }
				checked={ false }
				readOnly={ true }
				disabled={ disabled || siteError }
			/>

			{ tooltip && (
				<Tooltip
					context={ checkboxRef.current }
					isVisible={ showTooltip }
					position="bottom"
					className="site-select-checkbox__tooltip"
				>
					{ tooltip }
				</Tooltip>
			) }
		</span>
	);
}
