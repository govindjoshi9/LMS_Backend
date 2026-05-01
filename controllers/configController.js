const schoolsData = require('../config/schoolsData.json');

const getCountries = (req, res) => {
    res.json(schoolsData.countries);
};

const getSchoolsByCountry = (req, res) => {
    const { country } = req.query;
    if (!country) return res.status(400).json({ message: 'country query param required' });

    const schools = schoolsData.schools.filter(
        (s) => s.countryCode === country.toUpperCase()
    );
    res.json(schools);
};

const getClasses = (req, res) => {
    res.json(schoolsData.classes);
};

module.exports = { getCountries, getSchoolsByCountry, getClasses };
