import z from 'zod'

export const UserValidation = z.object({
    email: z.string().email(),
    password: z.string().min(8).refine((val) => {
        return (
            /[A-Z]/.test(val) &&       // uppercase
            /[a-z]/.test(val) &&       // lowercase
            /[^a-zA-Z0-9]/.test(val)   // special character
        );
    }, {
        message: "Password must contain at least one uppercase, one lowercase, and one special character.",
    })
})