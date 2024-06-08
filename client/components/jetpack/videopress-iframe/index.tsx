import clsx from 'clsx';

import './style.scss';

interface Props {
	videoURL: string;
	title?: string;
	className?: string;
	maintainAspectRatio: boolean;
	fullWidth: boolean;
	allowFullScreen: boolean;
}

const VideoPressIframe = ( {
	videoURL,
	title,
	className,
	maintainAspectRatio,
	fullWidth,
	allowFullScreen,
}: Props ) => {
	return (
		<iframe
			className={ clsx(
				{
					'maintain-aspect-ratio': maintainAspectRatio,
					'full-width': fullWidth,
				},
				className
			) }
			title={ title }
			aria-label={ title }
			src={ videoURL }
			allowFullScreen={ allowFullScreen }
		></iframe>
	);
};

VideoPressIframe.defaultProps = {
	maintainAspectRatio: true,
	fullWidth: true,
	allowFullScreen: true,
};

export default VideoPressIframe;
