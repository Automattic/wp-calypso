// The analytics (used for bumping stats on error) were causing issues with the tests, so we stub it
module.exports = {
	mc: {
		bumpStat: function(){}
	}
};
