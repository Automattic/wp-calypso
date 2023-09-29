import artworkImage from './artwork-image.jpg';

export function Artwork() {
	return (
		<svg
			version="1.1"
			xmlns="http://www.w3.org/2000/svg"
			xmlnsXlink="http://www.w3.org/1999/xlink"
			x="0px"
			y="0px"
			viewBox="0 0 318 108.8"
			role="presentation"
		>
			<g>
				<g>
					<defs>
						<path
							id="SVGID_1_"
							d="M308.9,80.9H9.3c-2.3,0-4.2-1.9-4.2-4.2V5.1c0-2.3,1.9-4.2,4.2-4.2h299.6c2.3,0,4.2,1.9,4.2,4.2v71.6
				C313.1,79,311.2,80.9,308.9,80.9z"
						/>
					</defs>
					<clipPath id="SVGID_00000023246103180827393560000009109268390538096033_">
						<use xlinkHref="#SVGID_1_" />
					</clipPath>
					<g
						transform="matrix(1 0 0 1 0 0)"
						style={ {
							clipPath: 'url(#SVGID_00000023246103180827393560000009109268390538096033_)',
						} }
					>
						<image
							width="5137"
							height="1383"
							xlinkHref={ artworkImage }
							transform="matrix(6.108444e-02 0 0 6.108444e-02 1.9946 0.9043)"
						></image>
					</g>
				</g>
			</g>
			<g id="Layer_2">
				<path
					fill="white"
					d="M45.7,57.1h226.9c1.6,0,3,1.3,3,3v44.8c0,1.6-1.3,3-3,3H45.7c-1.6,0-3-1.3-3-3V60C42.7,58.4,44,57.1,45.7,57.1
		z"
				/>
				<path
					fill="#ECECEC"
					d="M70.9,74.1h143.7c4.6,0,8.4,3.7,8.4,8.4l0,0c0,4.6-3.7,8.4-8.4,8.4H70.9c-4.6,0-8.4-3.7-8.4-8.4l0,0
		C62.5,77.8,66.3,74.1,70.9,74.1z"
				/>
				<path
					fill="#010202"
					d="M244,72.6c-5.4,0-9.8,4.4-9.8,9.8c0,5.4,4.4,9.8,9.8,9.8c5.4,0,9.8-4.4,9.8-9.8C253.8,77,249.4,72.6,244,72.6z
		 M245,89.3h-2v-2h2V89.3z M247,81.7l-0.9,0.9c-0.7,0.7-1.1,1.3-1.1,2.8h-2v-0.5c0-1.1,0.4-2.1,1.1-2.8l1.2-1.2
		c0.4-0.4,0.6-0.8,0.6-1.4c0-1.1-0.9-2-2-2s-2,0.9-2,2h-2c0-2.2,1.7-3.9,3.9-3.9s3.9,1.7,3.9,3.9C247.9,80.3,247.5,81.1,247,81.7z"
				/>
				<circle fill="#FFFFFF" stroke="#D52E83" strokeWidth="1.3429" cx="5.1" cy="21.4" r="4.4" />
			</g>
			<g id="Layer_1"></g>
		</svg>
	);
}
