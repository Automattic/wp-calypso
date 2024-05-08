import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import JetpackLogo from 'calypso/components/jetpack-logo';

import './style.scss';

interface JetpackColophonProps {
	className?: string;
	grayscale?: boolean;
}

export default ( { className, grayscale = false }: JetpackColophonProps ) => {
	const translate = useTranslate();
	return (
		<div className={ clsx( 'jetpack-colophon', className ) }>
			<span
				className={ clsx( 'jetpack-colophon__power', {
					'jetpack-colophon__grayscale': grayscale,
				} ) }
			>
				{ translate( 'Powered by {{jetpackLogo /}}', {
					components: {
						jetpackLogo: <JetpackLogo size={ 32 } full />,
					},
				} ) }
			</span>
		</div>
	);
};
