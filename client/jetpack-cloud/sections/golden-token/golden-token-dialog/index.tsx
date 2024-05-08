import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useRef, useState } from 'react';
import { useSelector } from 'calypso/state';
import { getCurrentUserName } from 'calypso/state/current-user/selectors';

import './style.scss';

export const GoldenTokenDialog = () => {
	const translate = useTranslate();
	const userName = useSelector( getCurrentUserName );

	const videoRef = useRef< HTMLVideoElement >( null );

	const [ isAnimating, setIsAnimating ] = useState( false );

	const redeemToken = () => {
		if ( videoRef.current ) {
			videoRef.current.play();
		}
		setIsAnimating( true );
	};

	return (
		<div className={ clsx( 'golden-token-dialog', { animating: isAnimating } ) }>
			<svg
				className="jetpack-logo"
				xmlns="http://www.w3.org/2000/svg"
				width="139"
				height="38"
				fill="none"
			>
				<path
					fill="#fff"
					fillRule="evenodd"
					d="M18.886 38c10.43 0 18.886-8.507 18.886-19S29.316 0 18.886 0 0 8.507 0 19s8.455 19 18.886 19Zm-.792-34.229v18.384H8.688L18.094 3.77Zm1.91 30.458v-18.42h9.444l-9.443 18.42Zm27.766-4.214c.314.505.632 1.018.965 1.53 4.358-2.139 5.547-4.46 5.547-8.593V6.708h-6.664v2.72h3.134v14.25c0 2.465-.9 3.77-3.566 5.402.194.307.388.62.584.935Zm28.88-8.187c0 1.378.972 1.523 1.62 1.523.65 0 1.586-.217 2.306-.435v2.538c-1.008.327-2.053.58-3.494.58-1.729 0-3.746-.652-3.746-3.698v-7.47H71.5v-2.574h1.837V8.485h3.314v3.807h4.178v2.575H76.65v6.961Zm6.916-9.572v20.523h3.313v-7.107c.865.181 1.693.326 2.738.326 4.286 0 6.88-2.973 6.88-7.47 0-4.532-2.378-6.635-5.367-6.635-1.73 0-3.134.616-4.395 1.595v-1.232h-3.17Zm3.35 3.88c1.152-1.016 2.377-1.487 3.35-1.487 1.836 0 2.809 1.269 2.809 4.133 0 3.119-1.333 4.605-3.674 4.605-1.009 0-1.765-.108-2.486-.253v-6.999Zm22.62 9.572h-3.098v-1.487h-.072c-1.08.834-2.413 1.74-4.394 1.74-1.729 0-3.602-1.268-3.602-3.843 0-3.444 2.917-4.097 4.97-4.387l2.918-.399v-.399c0-1.813-.72-2.393-2.413-2.393-.829 0-2.774.254-4.359.907l-.288-2.684c1.441-.507 3.422-.87 5.079-.87 3.242 0 5.331 1.305 5.331 5.185v8.63h-.072Zm-3.314-6.273-2.737.435c-.829.109-1.693.617-1.693 1.85 0 1.087.612 1.704 1.512 1.704.973 0 2.018-.58 2.918-1.233v-2.756Zm12.859 6.6c1.549 0 2.774-.29 4.142-.762h.036V22.48c-1.548.616-2.701.834-3.746.834-2.197 0-3.926-1.052-3.926-4.496 0-3.119 1.729-4.206 3.746-4.206 1.369 0 2.774.398 3.746.761v-2.828c-1.116-.363-2.125-.653-3.782-.653-4.43 0-7.168 2.72-7.168 7.107 0 4.17 1.981 7.034 6.952 7.034Zm10.898-8.574c-.254.316-.358.446-.452.555V6.708h-3.314v19.036h3.314v-6.381l5.151 6.381H139l-5.907-7.07 5.403-6.382h-4.323a646.65 646.65 0 0 0-4.193 5.167l-.001.001Zm-65.9 8.573c1.729 0 3.206-.217 4.935-.761h-.036V22.48c-1.405.507-2.63.834-3.998.834-2.486 0-4.143-.69-4.215-3.626h8.573c.01-.144.021-.285.034-.432.035-.41.074-.868.074-1.562 0-2.829-1.477-5.802-5.727-5.802-4.287 0-6.52 3.336-6.52 6.998 0 5.004 2.63 7.143 6.88 7.143Zm-.396-11.603c1.765 0 2.305 1.414 2.305 3.046h-5.187c.216-1.85 1.225-3.046 2.882-3.046Z"
					clipRule="evenodd"
				/>
			</svg>
			<div className="golden-token-dialog__video-wrap">
				{ /* The golden token video has no dialog, so no captions are needed. */ }
				{ /* eslint-disable-next-line jsx-a11y/media-has-caption */ }
				<video
					ref={ videoRef }
					src="https://videos.files.wordpress.com/oSlNIBQO/jetpack-golden-token.mp4"
				></video>
			</div>
			<div className="golden-token-dialog__content-wrap">
				<div className="golden-token-dialog__content-wrap-text">
					<p className="golden-token-dialog__hi-user">
						{ translate( 'Hey, %(userName)s', { args: { userName } } ) }{ ' ' }
					</p>
					<h2>{ translate( 'Your exclusive Jetpack Experience awaits' ) }</h2>
					<p>
						{ translate(
							'You have been gifted a Jetpack Golden Token. This unlocks a lifetime of Jetpack powers for your website.'
						) }
					</p>
				</div>
				<button onClick={ redeemToken }>{ translate( 'Redeem your token' ) }</button>
			</div>
			<div className="golden-token-dialog__powers-wrap golden-token-dialog__content-wrap">
				<div className="golden-token-dialog__content-wrap-text">
					<h2>{ translate( 'Super powers are ready!' ) }</h2>
					<p>
						{ translate(
							'Your Jetpack Golden Token provides a lifetime license for this website and includes the following products:'
						) }
					</p>
				</div>

				<div className="golden-token-dialog__jetpack-products">
					<div>
						<svg
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<mask
								id="mask0_3274_17235"
								style={ { maskType: 'alpha' } }
								maskUnits="userSpaceOnUse"
								x="4"
								y="5"
								width="16"
								height="12"
							>
								<path
									fillRule="evenodd"
									clipRule="evenodd"
									d="M17.3331 10.1123C17.3332 10.0972 17.3333 10.082 17.3333 10.0667C17.3333 7.6367 15.1843 5.66675 12.5333 5.66675C10.2955 5.66675 8.41542 7.07048 7.88371 8.96976C7.83383 8.96773 7.7837 8.9667 7.73333 8.9667C5.67147 8.9667 4 10.6904 4 12.8167C4 14.943 5.67147 16.6667 7.73333 16.6667L7.75555 16.6666H16.7819C16.7878 16.6667 16.7937 16.6667 16.7996 16.6667C18.5669 16.6667 19.9996 15.1892 19.9996 13.3667C19.9996 11.7316 18.8465 10.3742 17.3331 10.1123Z"
									fill="white"
								/>
							</mask>
							<g mask="url(#mask0_3274_17235)">
								<path
									d="M17.3331 10.1123L15.8332 10.0957L15.8191 11.3726L17.0773 11.5904L17.3331 10.1123ZM7.88371 8.96976L7.82248 10.4685L9.00824 10.517L9.32817 9.37414L7.88371 8.96976ZM7.73333 16.6667V18.1667H7.73784L7.73333 16.6667ZM7.75555 16.6666V15.1666H7.75105L7.75555 16.6666ZM16.7819 16.6666L16.7904 15.1666H16.7819V16.6666ZM18.833 10.1289C18.8332 10.1083 18.8333 10.0875 18.8333 10.0667H15.8333C15.8333 10.0764 15.8333 10.0861 15.8332 10.0957L18.833 10.1289ZM18.8333 10.0667C18.8333 6.68808 15.8872 4.16675 12.5333 4.16675V7.16675C14.4814 7.16675 15.8333 8.58531 15.8333 10.0667H18.8333ZM12.5333 4.16675C9.68497 4.16675 7.16851 5.9604 6.43924 8.56538L9.32817 9.37414C9.66232 8.18057 10.9061 7.16675 12.5333 7.16675V4.16675ZM7.94494 7.47101C7.87466 7.46814 7.80412 7.4667 7.73333 7.4667V10.4667C7.76328 10.4667 7.793 10.4673 7.82248 10.4685L7.94494 7.47101ZM7.73333 7.4667C4.79987 7.4667 2.5 9.90582 2.5 12.8167H5.5C5.5 11.475 6.54307 10.4667 7.73333 10.4667V7.4667ZM2.5 12.8167C2.5 15.7276 4.79987 18.1667 7.73333 18.1667V15.1667C6.54307 15.1667 5.5 14.1584 5.5 12.8167H2.5ZM7.73784 18.1667L7.76006 18.1666L7.75105 15.1666L7.72883 15.1667L7.73784 18.1667ZM7.75555 18.1666H16.7819V15.1666H7.75555V18.1666ZM16.7996 15.1667C16.7964 15.1667 16.7934 15.1666 16.7904 15.1666L16.7734 18.1666C16.7822 18.1667 16.791 18.1667 16.7996 18.1667V15.1667ZM18.4996 13.3667C18.4996 14.4046 17.6953 15.1667 16.7996 15.1667V18.1667C19.4385 18.1667 21.4996 15.9738 21.4996 13.3667H18.4996ZM17.0773 11.5904C17.8512 11.7243 18.4996 12.4404 18.4996 13.3667H21.4996C21.4996 11.0228 19.8418 9.02419 17.5889 8.63431L17.0773 11.5904Z"
									fill="#008710"
								/>
							</g>
						</svg>

						<h3>{ translate( 'VaultPress Backup' ) }</h3>
						<p>
							{ translate(
								'Save every change and get back online quickly with one‑click restores.'
							) }
						</p>
					</div>
					<div>
						<svg
							width="25"
							height="24"
							viewBox="0 0 25 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								fillRule="evenodd"
								clipRule="evenodd"
								d="M12.5 3.17627L19.25 6.24445V10.8183C19.25 14.7173 16.7458 18.4089 13.2147 19.5735C12.7507 19.7265 12.2493 19.7265 11.7853 19.5735C8.25416 18.4089 5.75 14.7173 5.75 10.8183V6.24445L12.5 3.17627ZM7.25 7.21032V10.8183C7.25 14.1312 9.39514 17.2057 12.2551 18.149C12.414 18.2014 12.586 18.2014 12.7449 18.149C15.6049 17.2057 17.75 14.1312 17.75 10.8183V7.21032L12.5 4.82396L7.25 7.21032Z"
								fill="#008710"
							/>
						</svg>

						<h3>{ translate( 'Scan' ) }</h3>
						<p>
							{ translate(
								'Automated scanning and one‑click fixes to keep your site ahead of security threats.'
							) }
						</p>
					</div>
				</div>

				<button>{ translate( 'Explore your new powers' ) }</button>
			</div>
		</div>
	);
};
