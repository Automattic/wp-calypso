type GrowAudienceIconProps = {
	className?: string;
};

const GrowAudienceIcon = ( { className }: GrowAudienceIconProps ) => (
	<svg
		className={ className }
		width="15"
		height="8"
		viewBox="0 0 15 8"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M0.496037 7.5455C0.728229 7.80091 1.12351 7.81975 1.37892 7.5875L5.54978 3.79583L8.90366 6.7305L12.8335 2.80066V5.45841H14.0835V0.666748H9.29183V1.91675H11.9496L8.84666 5.01966L5.53389 2.12097L0.538079 6.66258C0.28267 6.89483 0.263845 7.29008 0.496037 7.5455Z"
			fill="#1E1E1E"
		/>
	</svg>
);

export default GrowAudienceIcon;
