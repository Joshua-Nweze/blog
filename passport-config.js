// import { authenticate } from "passport"
import {Strategy as LocalStrategy} from "passport-local"
import bcrypt from "bcrypt"

export function initializePassport(passport, getUserByEmail) {
    const authenticateUser = async (email, password, done) => {
        const user = getUserByEmail(email)

        if (user == null) {
            return done(null, false, { message: 'Incorrect email or password' })
        }

        try {
            if (await bcrypt.compare(password, user.password)) {
                console.log("pwd dehased")
                return done(null, user)
            } else {
                return done(null, false, { message: 'Incorrect username or password' })
            }
        } catch (error) {
            done(error)
        }
    }

    passport.use(new LocalStrategy ({ usernameField: 'email' }, authenticateUser))

    passport.serializeUser((user, done) => {})
    passport.deserializeUser((id, done) => {})
}