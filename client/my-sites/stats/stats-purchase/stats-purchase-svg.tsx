import { useTranslate } from 'i18n-calypso';
import { COMPONENT_CLASS_NAME } from './stats-purchase-wizard';

interface StatsPurchaseSVG {
	isFree: boolean | undefined;
	hasHighlight: boolean;
	extraMessage: boolean;
}

const StatsPurchaseSVG = ( {
	isFree,
	hasHighlight = false,
	extraMessage = false,
}: StatsPurchaseSVG ) => {
	const translate = useTranslate();
	const message = translate( 'Thanks for being one of our biggest supporters!' );

	return (
		<>
			<svg xmlns="http://www.w3.org/2000/svg" width="456" height="383" fill="none">
				<g filter="url(#a)">
					<rect width="375.864" height="273" x="40" y="55" fill="#fff" rx="12.27" />
					<path
						fill="#101517"
						fillRule="evenodd"
						d="M91.053 101.218a2.687 2.687 0 1 0 0-5.374 2.687 2.687 0 0 0 0 5.374Zm0-1.612a1.075 1.075 0 1 0 0-2.15 1.075 1.075 0 0 0 0 2.15Z"
						clipRule="evenodd"
					/>
					<path
						fill="#101517"
						d="M88.635 107.667v-2.15a2.956 2.956 0 0 0-2.956-2.956h-4.3a2.956 2.956 0 0 0-2.955 2.956v2.15h1.612v-2.15c0-.742.602-1.344 1.343-1.344h4.3c.742 0 1.343.602 1.343 1.344v2.15h1.612ZM96.158 105.517v2.15h-1.612v-2.15c0-.742-.602-1.344-1.344-1.344h-2.687v-1.612h2.687a2.956 2.956 0 0 1 2.956 2.956Z"
					/>
					<path
						fill="#101517"
						fillRule="evenodd"
						d="M86.216 98.53a2.687 2.687 0 1 1-5.374.001 2.687 2.687 0 0 1 5.374 0Zm-1.612 0a1.075 1.075 0 1 1-2.15 0 1.075 1.075 0 0 1 2.15 0Z"
						clipRule="evenodd"
					/>
					<g clipPath="url(#b)">
						<rect
							width="109.63"
							height="24.721"
							fill="#069E08"
							rx="4.299"
							transform="matrix(0 -1 -1 0 233.464 293.605)"
						/>
					</g>
					<g clipPath="url(#c)">
						<rect
							width="152.622"
							height="25.795"
							fill="#069E08"
							rx="4.299"
							transform="matrix(0 -1 -1 0 200.146 293.605)"
						/>
					</g>
					<g clipPath="url(#d)">
						<rect
							width="96.732"
							height="24.721"
							fill="#069E08"
							rx="4.299"
							transform="matrix(0 -1 -1 0 165.752 293.605)"
						/>
					</g>
					<g clipPath="url(#e)">
						<rect
							width="119.303"
							height="24.721"
							fill="#069E08"
							rx="4.299"
							transform="matrix(0 -1 -1 0 132.433 293.605)"
						/>
					</g>
					<g clipPath="url(#f)">
						<rect
							width="85.984"
							height="24.721"
							fill="#069E08"
							rx="4.299"
							transform="matrix(0 -1 -1 0 99.114 293.605)"
						/>
					</g>
					{ !! isFree && (
						<>
							<g>
								<path
									fill="#758391"
									d="m321.328 165.094-.953-2.914h-4.148l-.969 2.914h-2.039l4-11.274h2.265l4.008 11.274h-2.164Zm-3.086-9.156-1.547 4.687h3.211l-1.531-4.687h-.133Zm7.028-2.118h4.226c3.352 0 5.305 2.047 5.305 5.586 0 3.617-1.93 5.688-5.305 5.688h-4.226V153.82Zm2.015 1.696v7.882h1.946c2.242 0 3.515-1.421 3.515-3.96 0-2.485-1.304-3.922-3.515-3.922h-1.946Z"
								/>
								<rect
									width="111.612"
									height="34"
									x="268.858"
									y="142.094"
									stroke="#E9EFF5"
									strokeWidth="2"
									rx="3"
								/>
								<circle cx="368" cy="101" r="18.25" stroke="#D63638" strokeWidth="1.5" />
								<path stroke="#D63638" strokeWidth="1.5" d="m381.45 88.61-25.84 25.84" />
							</g>
						</>
					) }
					<path
						fill="#E9EFF5"
						d="M267.858 205.111c0-5.976 4.844-10.82 10.82-10.82h91.972c5.976 0 10.82 4.844 10.82 10.82s-4.844 10.82-10.82 10.82h-91.972c-5.976 0-10.82-4.844-10.82-10.82ZM267.858 243.947c0-5.976 4.844-10.82 10.82-10.82h91.972c5.976 0 10.82 4.844 10.82 10.82s-4.844 10.82-10.82 10.82h-91.972c-5.976 0-10.82-4.844-10.82-10.82ZM267.858 282.785c0-5.976 4.844-10.82 10.82-10.82h52.749c5.975 0 10.82 4.844 10.82 10.82s-4.845 10.82-10.82 10.82h-52.749c-5.976 0-10.82-4.844-10.82-10.82Z"
					/>
					<path
						fill="#101517"
						fillRule="evenodd"
						d="m361.716 99.818.473-.473h6.246v-5.508h-7.523v6.787l.804-.806Zm7.257 1.139h-6.116l-2.104 2.107a.852.852 0 0 1-1.454-.602v-9.163c0-.593.482-1.074 1.075-1.074h8.599c.593 0 1.074.48 1.074 1.074v6.584c0 .593-.481 1.074-1.074 1.074Zm5.106 8.534-.472-.473h-6.247v-5.508h7.524v6.787l-.805-.806Zm-7.256 1.14h6.116l2.103 2.106a.85.85 0 0 0 1.454-.602v-9.162c0-.594-.481-1.075-1.075-1.075h-8.598c-.594 0-1.075.481-1.075 1.075v6.583c0 .593.481 1.075 1.075 1.075Z"
						clipRule="evenodd"
						opacity=".5"
					/>
				</g>
				<defs>
					<clipPath id="b">
						<rect
							width="109.63"
							height="24.721"
							fill="#fff"
							rx="4.299"
							transform="matrix(0 -1 -1 0 233.464 293.605)"
						/>
					</clipPath>
					<clipPath id="c">
						<rect
							width="152.622"
							height="25.795"
							fill="#fff"
							rx="4.299"
							transform="matrix(0 -1 -1 0 200.146 293.605)"
						/>
					</clipPath>
					<clipPath id="d">
						<rect
							width="96.732"
							height="24.721"
							fill="#fff"
							rx="4.299"
							transform="matrix(0 -1 -1 0 165.752 293.605)"
						/>
					</clipPath>
					<clipPath id="e">
						<rect
							width="119.303"
							height="24.721"
							fill="#fff"
							rx="4.299"
							transform="matrix(0 -1 -1 0 132.433 293.605)"
						/>
					</clipPath>
					<clipPath id="f">
						<rect
							width="85.984"
							height="24.721"
							fill="#fff"
							rx="4.299"
							transform="matrix(0 -1 -1 0 99.114 293.605)"
						/>
					</clipPath>
					<filter
						id="a"
						width="484.066"
						height="381.202"
						x="-14.101"
						y=".899"
						colorInterpolationFilters="sRGB"
						filterUnits="userSpaceOnUse"
					>
						<feFlood floodOpacity="0" result="BackgroundImageFix" />
						<feColorMatrix
							in="SourceAlpha"
							result="hardAlpha"
							values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
						/>
						<feOffset />
						<feGaussianBlur stdDeviation="27.05" />
						<feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0" />
						<feBlend in2="BackgroundImageFix" result="effect1_dropShadow_3568_12212" />
						<feBlend in="SourceGraphic" in2="effect1_dropShadow_3568_12212" result="shape" />
					</filter>
				</defs>
			</svg>

			{ hasHighlight && (
				<>
					<div className={ `${ COMPONENT_CLASS_NAME }__celebrate` }>
						{ extraMessage && (
							<p className={ `${ COMPONENT_CLASS_NAME }__biggest-supporters` }>{ message }</p>
						) }
						<svg xmlns="http://www.w3.org/2000/svg" width="456" height="596" fill="none">
							<path
								fill="#31CC9F"
								d="m210.866 115.195 4.45-1.654 3.02 8.122-4.451 1.654zM226.729 470.002l-4.45 1.654-3.02-8.122 4.451-1.654z"
							/>
							<g filter="url(#a)">
								<path fill="#E34C84" d="m-.907 93.68 14.29 3.83-6.987 26.077-14.29-3.829z" />
							</g>
							<g filter="url(#b)">
								<path fill="#E34C84" d="m438.501 465.186-14.29-3.83 6.987-26.077 14.29 3.829z" />
							</g>
							<g filter="url(#c)">
								<path fill="#31CC9F" d="m131.773 442.674 6.552-3.91 7.136 11.954-6.552 3.911z" />
							</g>
							<g filter="url(#d)">
								<path fill="#31CC9F" d="m334.162 66.412-7.34 2.082-3.8-13.394 7.34-2.082z" />
							</g>
							<g filter="url(#e)">
								<path fill="#31CC9F" d="m385.47 532.162.47 7.616-13.897.857-.47-7.616z" />
							</g>
							<circle
								cx="119.18"
								cy="45.952"
								r="4.312"
								fill="#6AB3D0"
								transform="rotate(30 119.18 45.952)"
							/>
							<circle
								cx="290.857"
								cy="513.072"
								r="4.312"
								fill="#6AB3D0"
								transform="rotate(95.743 290.857 513.072)"
							/>
							<circle cx="109.411" cy="308.976" r="2.855" fill="#6AB3D0" />
							<circle
								cx="424.975"
								cy="214.474"
								r="2.855"
								fill="#6AB3D0"
								transform="rotate(-165 424.975 214.474)"
							/>
							<circle
								cx="219.166"
								cy="33.57"
								r="2.855"
								fill="#618DF2"
								transform="rotate(30 219.166 33.57)"
							/>
							<circle cx="99.722" cy="123.318" r="2.855" fill="#B35EB1" />
							<circle
								cx="337.872"
								cy="435.547"
								r="2.855"
								fill="#B35EB1"
								transform="rotate(-180 337.872 435.547)"
							/>
							<circle cx="67.544" cy="131.122" r="2.855" fill="#F2D76B" />
							<circle
								cx="370.049"
								cy="405.174"
								r="2.855"
								fill="#F2D76B"
								transform="rotate(-180 370.049 405.174)"
							/>
							<g filter="url(#f)">
								<circle cx="457.968" cy="298.277" r="8.322" fill="#FAA754" />
							</g>
							<g filter="url(#g)">
								<circle
									cx="434.483"
									cy="119.353"
									r="8.322"
									fill="#FAA754"
									transform="rotate(-165 434.483 119.353)"
								/>
							</g>
							<defs>
								<filter
									id="a"
									width="38.883"
									height="47.513"
									x="-16.697"
									y="84.877"
									colorInterpolationFilters="sRGB"
									filterUnits="userSpaceOnUse"
								>
									<feFlood floodOpacity="0" result="BackgroundImageFix" />
									<feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
									<feGaussianBlur result="effect1_foregroundBlur_3568_14033" stdDeviation="4.401" />
								</filter>
								<filter
									id="b"
									width="38.883"
									height="47.513"
									x="415.408"
									y="426.475"
									colorInterpolationFilters="sRGB"
									filterUnits="userSpaceOnUse"
								>
									<feFlood floodOpacity="0" result="BackgroundImageFix" />
									<feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
									<feGaussianBlur result="effect1_foregroundBlur_3568_14033" stdDeviation="4.401" />
								</filter>
								<filter
									id="c"
									width="20.09"
									height="22.267"
									x="128.573"
									y="435.563"
									colorInterpolationFilters="sRGB"
									filterUnits="userSpaceOnUse"
								>
									<feFlood floodOpacity="0" result="BackgroundImageFix" />
									<feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
									<feGaussianBlur result="effect1_foregroundBlur_3568_14033" stdDeviation="1.6" />
								</filter>
								<filter
									id="d"
									width="17.541"
									height="21.878"
									x="319.822"
									y="49.817"
									colorInterpolationFilters="sRGB"
									filterUnits="userSpaceOnUse"
								>
									<feFlood floodOpacity="0" result="BackgroundImageFix" />
									<feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
									<feGaussianBlur result="effect1_foregroundBlur_3568_14033" stdDeviation="1.6" />
								</filter>
								<filter
									id="e"
									width="20.768"
									height="14.874"
									x="368.372"
									y="528.961"
									colorInterpolationFilters="sRGB"
									filterUnits="userSpaceOnUse"
								>
									<feFlood floodOpacity="0" result="BackgroundImageFix" />
									<feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
									<feGaussianBlur result="effect1_foregroundBlur_3568_14033" stdDeviation="1.6" />
								</filter>
								<filter
									id="f"
									width="34.249"
									height="34.249"
									x="440.844"
									y="281.153"
									colorInterpolationFilters="sRGB"
									filterUnits="userSpaceOnUse"
								>
									<feFlood floodOpacity="0" result="BackgroundImageFix" />
									<feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
									<feGaussianBlur result="effect1_foregroundBlur_3568_14033" stdDeviation="4.401" />
								</filter>
								<filter
									id="g"
									width="34.253"
									height="34.251"
									x="417.357"
									y="102.227"
									colorInterpolationFilters="sRGB"
									filterUnits="userSpaceOnUse"
								>
									<feFlood floodOpacity="0" result="BackgroundImageFix" />
									<feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
									<feGaussianBlur result="effect1_foregroundBlur_3568_14033" stdDeviation="4.401" />
								</filter>
							</defs>
						</svg>
					</div>
				</>
			) }
		</>
	);
};

export default StatsPurchaseSVG;
