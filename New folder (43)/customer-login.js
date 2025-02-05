<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Customer Login - Your Store</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <div class="background-dots"></div>
    
    <div class="login-container">
        <form id="loginForm" class="login-form">
            <h2>Customer Login</h2>
            <div class="form-group">
                <label>Email</label>
                <input type="email" name="email" required>
            </div>
            <div class="form-group">
                <label>Password</label>
                <input type="password" name="password" required>
            </div>
            <button type="submit" class="primary-btn">Login</button>
            <div class="auth-options">
                <p class="divider">OR</p>
                <button onclick="enterGuestMode()" class="guest-btn">
                    <i class="fas fa-user-secret"></i>
                    Continue as Guest
                </button>
            </div>
            <div class="form-footer">
                <p>Don't have an account? <a href="#" id="showRegister">Register</a></p>
            </div>
        </form>

        <form id="registerForm" class="login-form" style="display: none;">
            <h2>Create Account</h2>
            <div class="form-group">
                <label>Full Name</label>
                <input type="text" name="fullname" required>
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" name="email" required>
            </div>
            <div class="form-group">
                <label>Password</label>
                <input type="password" name="password" required>
            </div>
            <div class="form-group">
                <label>Confirm Password</label>
                <input type="password" name="confirm_password" required>
            </div>
            <button type="submit" class="primary-btn">Register</button>
            <div class="form-footer">
                <p>Already have an account? <a href="#" id="showLogin">Login</a></p>
            </div>
        </form>

        <div id="verificationForm" class="login-form" style="display: none;">
            <h2>Email Verification</h2>
            <p>Please check your email for the verification code</p>
            <div class="form-group">
                <input type="text" 
                       id="verificationCode" 
                       placeholder="000000" 
                       maxlength="6">
            </div>
            <div class="verification-buttons">
                <button type="button" class="primary-btn verify-btn">Verify</button>
                <button type="button" class="primary-btn resend-btn">Resend Code</button>
            </div>
            <div class="social-buttons">
                <a href="https://discord.gg/Wj7mVvZnzT" target="_blank" class="discord-btn">
                    <i class="fab fa-discord"></i> Join our Discord
                </a>
            </div>
        </div>
    </div>

    <script src="customer-login.js"></script>
</body>
</html> 
