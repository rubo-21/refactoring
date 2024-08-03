import { useState } from "react";
import PropTypes from "prop-types";
import { toast } from 'react-toastify';

const { string } = PropTypes;

const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;

function GdprUpdatePassword({ redirect, company: companyFromProps }) {
    // set states
    const [saving, setSaving] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmationPassword, setConfirmationPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [gdpr, setGdpr] = useState(false);
    const [gdprError, setGdprError] = useState("");
    const [company, setCompany] = useState(companyFromProps);
    const [email, setEmail] = useState("");

    // universal function to handle password change
    const handlePasswordChange = (state) => (event) => {
        state(event.target.value);
        setPasswordError("");
    };

    const handleCompanyChange = (event) => {
        const { value } = event.target;
        setCompany(value);
        setGdprError("");
    };

    const activateGdpr = () => {
        setGdpr(true);
        setGdprError("");
    };

    const disableGdpr = () => {
        setGdpr(false);
        setGdprError("");
    };

    const handleSaveClick = () => {
        if (saving) {
            return false;
        }

        let error = null;
        // check if password is at least 8 characters containing at least 1 uppercase letter and 1 number
        if (passwordRegex.test(password) === false) {
            error = "Password must be at least 8 characters containing at least 1 uppercase letter and 1 number.";
            setPasswordError(error);
            return;
        }
        // check if passwords match
        if (password !== confirmationPassword) {
            error = "Passwords don't match.";
            setPasswordError(error);
            return;
        }
        // check if company is entered
        if (gdpr && !company) {
            error = "Please enter your company name.";
            setGdprError(error);
            return;
        }

        // enable saving
        setSaving(true);
        save();
    };

    const handleSaveKeyDown = (event) => {
        if (event.code === 'Enter' ) {
            handleSaveClick();
        }
        event.preventDefault();
    };

    const save = async () => {
        try {
            await saveGdpr();
            await savePassword();

            setSaving(false);
            if (redirect) {
                toast.success('You password and preferences successfully updated. Redirecting...')
                setTimeout(() => {
                    window.location.href = redirect;
                }, 2000);
            }
        } catch (err) {
            console.log("Error:", err);
            setSaving(false);
        }
    };

    const saveGdpr = async () => {
        try {
            // fetch request to save GDPR
            const response = await fetch("/manage/settings/general/save-gdpr", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    gdpr,
                    company,
                    email,
                }),
            });

            const { isSaved, error } = await response.json();
            // if there is an error, store error and throw
            if (error) {
                setGdprError(error);
                throw new Error(error);
            }
            if (isSaved) {
                // GDPR saved. do something
                return;
            }
        } catch (err) {
            console.error("saveGDPRError:", err);
            toast.error(`Failed to save GDPR. ${err.message}`);
        }
    };

    const savePassword = async () => {
        try {
            // fetch request to save password
            const response = await fetch("/manage/settings/general/save-strong-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    password,
                }),
            });

            const { isSaved, error } = await response.json();
        
            // if there is an error, store error and throw
            if (error) {
                setPasswordError(error);
                throw new Error(error);
            }
            if (isSaved) {
                // password saved. do something
                return;
            }
        } catch (err) {
            console.error("savePasswordError:", err);
            // if there is an error, show message
            toast.error(`Failed to save password. ${err.message}`);
        }
    };

    const renderPasswordError = () => {
        if (passwordError.length > 0) {
            return (
                <div className="footer">
                    <div className="error">{passwordError.map((err, index) => <p className="error-item" key={index}>{err}</p>)}</div>
                </div>
            );
        }

        return null;
    };

    const renderPasswordForm = () => {
        return (
            <div className="GdprUpdatePassword__pass pretty-form preferences-section">
                <div className="header">
                    <div className="title">Step 1: Update your password</div>
                </div>
                <div className="body pretty-controls">
                    <div className="line">
                        <div className="form-group first">
                            <label className="nm">New Password:</label>
                            <small>
                                Password length must be at least 8 characters containing at
                                least 1 uppercase letter and 1 number.
                            </small>
                            <input
                                className="input"
                                placeholder="Set your new password"
                                tabIndex="1"
                                autoFocus={true}
                                value={password}
                                onChange={handlePasswordChange(setPassword)}
                            />
                        </div>
                        <div className="form-group second">
                            <label>Repeat New Password:</label>
                            <input
                                className="input"
                                placeholder="Repeat your new password"
                                tabIndex="2"
                                value={confirmationPassword}
                                onChange={handlePasswordChange(setConfirmationPassword)}
                            />
                        </div>
                    </div>
                </div>
                {renderPasswordError()}
            </div>
        );
    };

    const renderGdprOptInError = () => {
        // if there are gdpr errors, show them
        if (gdprError.length > 0) {
            return (
                <div className="footer">
                    <div className="error">{gdprError.map((err, index) => <p className="error-item" key={index}>{err}</p>)}</div>
                </div>
            );
        }
        // if there are no errors, show nothing
        return null;
    };

    const renderGdprOptIn = () => {
        return (
            <div className="GdprUpdatePassword__opt-in pretty-form preferences-section">
                <div className="header">
                    <div className="title">
                        Step 2: Confirm your GDPR compliancy settings.
                    </div>
                </div>
                <div className="body">
                    <div className="text">
                        Enabling your GDPR compliancy settings in Demio will disable certain
                        features and require registrants to confirm their request for more
                        information. All EU companies should enable this setting.
                    </div>
                    <div className="line">
                        <div className="caption">
                            Enable GDPR compliancy settings in Demio
                        </div>
                        <div className="switcher">
                            <div
                                className={"item" + (gdpr ? " active" : "")}
                                onClick={activateGdpr}
                            >
                                Active
                            </div>
                            <div
                                className={"item second" + (!gdpr ? " active" : "")}
                                onClick={disableGdpr}
                            >
                                Disabled
                            </div>
                        </div>
                    </div>
                    <div className="line pretty-controls">
                        <div className="form-group">
                            <label>Company Name:</label>
                            <input
                                className="input"
                                type="text"
                                placeholder="Enter your company name"
                                tabIndex="3"
                                value={company}
                                onChange={handleCompanyChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Your email:</label>
                            <input
                                className="input"
                                type="text"
                                placeholder="Enter your email"
                                tabIndex="3"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                {renderGdprOptInError()}
            </div>
        );
    };

    return (
        <div className="GdprUpdatePassword__component">
            {renderPasswordForm()}
            {renderGdprOptIn()}
            <div className="GdprUpdatePassword__submit">
                <div
                    className="GdprUpdatePassword__btn"
                    onClick={handleSaveClick}
                    onKeyDown={handleSaveKeyDown}
                    tabIndex="4"
                >
                    Update My Password & Preferences
                </div>
            </div>
        </div>
    );
}

GdprUpdatePassword.propTypes = {
    redirect: string,
    company: string.isRequired,
};

export default GdprUpdatePassword;
